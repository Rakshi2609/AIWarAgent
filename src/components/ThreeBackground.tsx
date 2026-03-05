'use client';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Preload the models
useGLTF.preload('/models/Xbot.glb');

interface RobotProps {
    position: [number, number, number];
    rotation: [number, number, number];
    isAttacker?: boolean;
    onHit?: (pos: THREE.Vector3) => void;
}

function TerminatorBot({ position, rotation, isAttacker, onHit }: RobotProps) {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF('/models/Xbot.glb');

    // Clone the scene and apply Chrome / Terminator shader
    const clone = useMemo(() => {
        const clonedScene = scene.clone();

        // Find the head bone to attach eyes
        let headBone: THREE.Object3D | null = null;

        clonedScene.traverse((node: any) => {
            if (node.isBone && node.name === 'mixamorigHead') {
                headBone = node;
            }
            if (node.isMesh) {
                // Apply a dark, highly reflective Chrome standard material
                node.material = new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    metalness: 0.95,
                    roughness: 0.1,
                    envMapIntensity: 2.0,
                });
            }
        });

        // Add glowing red eyes to the head bone
        if (headBone) {
            const eyeGeo = new THREE.SphereGeometry(2, 8, 8); // Scale relative to head bone
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

            // Left Eye
            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(4, 5, 10);
            // Right Eye
            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(-4, 5, 10);

            // Point lights for the glow cast on environment
            const leftLight = new THREE.PointLight(0xff0000, 2, 50);
            leftEye.add(leftLight);
            const rightLight = new THREE.PointLight(0xff0000, 2, 50);
            rightEye.add(rightLight);

            (headBone as THREE.Object3D).add(leftEye);
            (headBone as THREE.Object3D).add(rightEye);
        }

        return clonedScene;
    }, [scene]);

    const { actions } = useAnimations(animations, group);

    // Initial pose & Idle
    useEffect(() => {
        if (actions["agree"]) {
            actions["agree"].stop();
        }
        // Force an idle-ish look by playing a subtle animation if available, or just standing
        if (actions["idle"]) {
            actions["idle"].play();
        } else if (actions["walk"]) {
            actions["walk"].play();
            actions["walk"].timeScale = 0.5; // Slow walk looks menacing
        }
    }, [actions]);

    // Fight Choreography
    useEffect(() => {
        if (!group.current || !actions["run"]) return;

        let ctx = gsap.context(() => {
            if (isAttacker) {
                // Attacker Sequence: Dash in -> Hit -> Dash back -> Wait
                const performAttack = () => {
                    // 1. Dash In
                    gsap.to(group.current!.position, {
                        x: 0, // Center
                        z: 0,
                        duration: 0.3,
                        ease: "power2.inOut",
                        onComplete: () => {
                            // Hit lands!
                            if (onHit) {
                                // Send rough hit position
                                const hitPos = new THREE.Vector3().copy(group.current!.position);
                                hitPos.y += 1.5; // Chest height
                                onHit(hitPos);
                            }

                            // 2. Dash out quickly (recoil)
                            gsap.to(group.current!.position, {
                                x: position[0],
                                z: position[2],
                                duration: 0.5,
                                delay: 0.1,
                                ease: "power3.out",
                                onComplete: () => {
                                    // 3. Wait and attack again
                                    gsap.delayedCall(Math.random() * 2 + 1, performAttack);
                                }
                            });
                        }
                    });
                };

                // Start sequence after short delay
                gsap.delayedCall(1, performAttack);

            } else {
                // Defender Sequence: Listen for hits and recoil
                const handleHit = () => {
                    if (!group.current) return;
                    // Violent shake/knockback
                    gsap.fromTo(group.current.position,
                        { x: 0 }, // assuming defender is mostly at 0
                        {
                            x: position[0] + (Math.random() > 0.5 ? 0.5 : -0.5),
                            z: position[2] - 0.5,
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1,
                            ease: "rough({ template: power1.out, strength: 2, points: 10, taper: 'none', randomize: true, clamp: false})"
                        }
                    );
                    // Slight rotation knockback
                    gsap.fromTo(group.current.rotation,
                        { z: rotation[2] },
                        {
                            z: rotation[2] + (Math.random() * 0.2 - 0.1),
                            duration: 0.1,
                            yoyo: true,
                            repeat: 1
                        }
                    );
                };
                window.addEventListener('robot-hit', handleHit);
                return () => window.removeEventListener('robot-hit', handleHit);
            }
        });

        return () => ctx.revert();
    }, [isAttacker, position, rotation, onHit, actions]);


    return (
        <group ref={group} position={position} rotation={rotation} scale={1.2}>
            <primitive object={clone} />
        </group>
    );
}

// Particle system for hits (Sparks)
function BurstSparks({ position }: { position: THREE.Vector3 }) {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.PointsMaterial>(null);

    // Create random spark geometry
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const count = 50;
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            // Random explosion velocity
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            ));
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.userData = { velocities, count };
        return geo;
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current && geometry) {
            const positions = geometry.attributes.position.array as Float32Array;
            const velocities = geometry.userData.velocities as THREE.Vector3[];

            for (let i = 0; i < geometry.userData.count; i++) {
                positions[i * 3] += velocities[i].x * delta;
                positions[i * 3 + 1] += velocities[i].y * delta;
                positions[i * 3 + 2] += velocities[i].z * delta;

                // Gravity / drag
                velocities[i].y -= 9.8 * delta;
                velocities[i].multiplyScalar(0.95);
            }
            geometry.attributes.position.needsUpdate = true;

            // Fade out
            if (materialRef.current) {
                materialRef.current.opacity -= delta * 2;
                if (materialRef.current.opacity < 0) materialRef.current.opacity = 0;
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <points geometry={geometry}>
                <pointsMaterial ref={materialRef} color="#ffaa00" size={0.1} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
        </group>
    );
}

function BattleScene() {
    const [sparks, setSparks] = useState<{ id: number, pos: THREE.Vector3 }[]>([]);
    const sparkIdCount = useRef(0);

    const handleHit = (pos: THREE.Vector3) => {
        // Trigger event for the defender robot to recoil
        window.dispatchEvent(new Event('robot-hit'));

        // Add a spark burst
        const id = sparkIdCount.current++;
        setSparks(prev => [...prev.slice(-4), { id, pos }]); // Keep max 5 active
    };

    return (
        <group position={[0, -2, -6]}> {/* Center stage moved back */}

            {/* Attacker */}
            <TerminatorBot
                position={[-3, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                isAttacker={true}
                onHit={handleHit}
            />

            {/* Defender */}
            <TerminatorBot
                position={[0, 0, 0]} // Defender stays central
                rotation={[0, -Math.PI / 2, 0]}
                isAttacker={false}
            />

            {/* Render active sparks */}
            {sparks.map(spark => (
                <BurstSparks key={spark.id} position={spark.pos} />
            ))}

            {/* Burning Ground / Cyber Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[4, 4.2, 64]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <circleGeometry args={[10, 64]} />
                <meshStandardMaterial color="#111" roughness={0.8} metalness={0.2} />
            </mesh>
        </group>
    );
}

function CameraController() {
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const cameraGroup = useRef<THREE.Group>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Listen for hits to shake camera
        const handleShake = () => {
            if (cameraGroup.current) {
                gsap.fromTo(cameraGroup.current.position,
                    { x: 0, y: 0, z: 0 },
                    {
                        x: (Math.random() - 0.5) * 0.5,
                        y: (Math.random() - 0.5) * 0.5,
                        duration: 0.2, // short shake
                        ease: "rough({ template: power1.out, strength: 3, points: 10, taper: 'in', randomize: true, clamp: false})"
                    }
                );
            }
        }
        window.addEventListener('robot-hit', handleShake);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('robot-hit', handleShake);
        }
    }, []);

    useFrame((state) => {
        // Smoothly interpolate camera position based on mouse for parallax
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 2, 0.05);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, Math.max(0, mouse.y * 2) + 1, 0.05);
        state.camera.lookAt(0, 0, -6);
    });

    return <group ref={cameraGroup} />;
}

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-black">
            <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
                <CameraController />

                {/* Harsh Red/Blue Fog */}
                <fog attach="fog" args={['#0a0000', 5, 20]} />

                {/* Dramatic Terminator Lighting */}
                <ambientLight intensity={0.1} />
                <directionalLight position={[-5, 8, 5]} intensity={3} color="#ff0000" castShadow />
                <directionalLight position={[5, 8, -5]} intensity={2} color="#0088ff" />
                <pointLight position={[0, 2, -6]} intensity={5} color="#ffffff" distance={10} />

                {/* Debris / Stars */}
                <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={3} />

                <BattleScene />
            </Canvas>
        </div>
    );
}
