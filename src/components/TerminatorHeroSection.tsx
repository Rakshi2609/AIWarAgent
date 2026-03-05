'use client';

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Terminal, Zap, ChevronDown } from 'lucide-react';

// ─── Preload ──────────────────────────────────────────────────────────────────
useGLTF.preload('/models/RobotExpressive.glb');

// ─── Types ───────────────────────────────────────────────────────────────────
type AnimationName = 'Idle' | 'Wave' | 'Punch' | 'Jump' | 'Dance' | 'Death' | 'ThumbsUp' | 'Yes' | 'No' | 'Running' | 'Walking';

const KEY_ANIMATION_MAP: Record<string, AnimationName> = {
    w: 'Wave',
    a: 'Punch',
    s: 'Jump',
    d: 'Dance',
    ' ': 'Death',
};

const ANIM_LABELS: Record<string, { label: string; color: string }> = {
    w: { label: 'WAVE', color: '#38bdf8' },
    a: { label: 'PUNCH', color: '#f97316' },
    s: { label: 'JUMP', color: '#a78bfa' },
    d: { label: 'DANCE', color: '#34d399' },
    ' ': { label: 'POWER POSE', color: '#ef4444' },
};

// ─── Utility: Typewriter ──────────────────────────────────────────────────────
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        let i = 0;
        const t = setTimeout(() => {
            const iv = setInterval(() => {
                if (i <= text.length) { setDisplayed(text.slice(0, i)); i++; }
                else clearInterval(iv);
            }, 28);
            return () => clearInterval(iv);
        }, delay * 1000);
        return () => clearTimeout(t);
    }, [text, delay]);

    return (
        <span className="font-mono relative inline-block">
            <span className="opacity-0">{text}</span>
            <span className="absolute left-0 top-0 text-sky-300/80">{displayed}</span>
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[2px] h-[1em] bg-sky-400 ml-0.5 translate-y-[0.1em]"
            />
        </span>
    );
}

const COUNT = 180;
const defaultPositions = new Float32Array(COUNT * 3);
const defaultSpeeds = new Float32Array(COUNT);

for (let i = 0; i < COUNT; i++) {
    defaultPositions[i * 3] = (Math.random() - 0.5) * 20;
    defaultPositions[i * 3 + 1] = Math.random() * 12 - 2;
    defaultPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    defaultSpeeds[i] = 0.02 + Math.random() * 0.04;
}

// ─── 3D: Ambient Particle Field ───────────────────────────────────────────────
function ParticleField() {
    const pointsRef = useRef<THREE.Points>(null);
    const [positions] = useState(() => Float32Array.from(defaultPositions));
    const [speeds] = useState(() => Float32Array.from(defaultSpeeds));

    useFrame((_, delta) => {
        if (!pointsRef.current) return;
        const arr = (pointsRef.current.geometry.attributes.position.array as Float32Array);
        for (let i = 0; i < COUNT; i++) {
            arr[i * 3 + 1] += speeds[i] * delta * 30;
            // Flicker horizontally
            arr[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002;
            if (arr[i * 3 + 1] > 10) {
                arr[i * 3 + 1] = -2;
                arr[i * 3] = (Math.random() - 0.5) * 20;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#ff4400"
                size={0.04}
                transparent
                opacity={0.7}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </points>
    );
}

// ─── 3D: Dramatic Lights ─────────────────────────────────────────────────────
function CinematicLights() {
    const redRef = useRef<THREE.PointLight>(null);
    const blueRef = useRef<THREE.PointLight>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (redRef.current) redRef.current.intensity = 3.5 + Math.sin(t * 2.1) * 0.5;
        if (blueRef.current) blueRef.current.intensity = 2 + Math.sin(t * 1.7 + 1) * 0.4;
    });

    return (
        <>
            <ambientLight intensity={0.4} />
            {/* Red key light — left top */}
            <directionalLight ref={redRef} position={[-5, 6, 5]} color="#ff2200" intensity={4} castShadow />
            {/* Blue fill — right */}
            <directionalLight ref={blueRef} position={[6, 3, -2]} color="#0066ff" intensity={3} />
            {/* Rim/back white */}
            <pointLight position={[0, 4, -8]} color="#ffffff" intensity={4} distance={15} />
            {/* Ground orange bounced */}
            <pointLight position={[0, -2, 2]} color="#ff6600" intensity={0.8} distance={10} />
        </>
    );
}



// ─── 3D: Terminator Model ─────────────────────────────────────────────────────
interface TerminatorModelProps {
    mouseNDC: React.MutableRefObject<{ x: number; y: number }>;
    currentAnim: AnimationName;
}

function TerminatorModel({ mouseNDC, currentAnim }: TerminatorModelProps) {
    const group = useRef<THREE.Group>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { scene, animations } = useGLTF('/models/RobotExpressive.glb') as any;
    const { actions, mixer } = useAnimations(animations, group);

    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    // Chrome material + eye meshes applied directly to cloned scene safely
    const processedScene = useMemo(() => {
        let headBone: THREE.Object3D | null = null;

        clone.traverse((node: THREE.Object3D) => {
            if ((node as THREE.Bone).isBone && (node.name.toLowerCase().includes('head') || node.name === 'Head')) {
                headBone = node;
            }
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh) {
                if (mesh.material) {
                    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                    mats.forEach((mat) => {
                        const m = mat as THREE.MeshStandardMaterial;
                        if (!m.userData.isChrome) {
                            m.color.setHex(0x555555);
                            m.metalness = 0.95;
                            m.roughness = 0.2;
                            m.envMapIntensity = 4.0;
                            if (m.emissive) m.emissive.setHex(0x111111);
                            m.userData.isChrome = true;
                        }
                    });
                }
                mesh.castShadow = true;
            }
        });

        // Glowing eye meshes
        const headObj = headBone as THREE.Object3D | null;
        if (headObj && !headObj.getObjectByName('terminator_left_eye')) {
            const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, toneMapped: false });

            const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
            leftEye.position.set(0.06, 0.1, 0.15);
            leftEye.name = 'terminator_left_eye';

            const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
            rightEye.position.set(-0.06, 0.1, 0.15);
            rightEye.name = 'terminator_right_eye';

            headObj.add(leftEye);
            headObj.add(rightEye);
        }

        return clone;
    }, [clone]);

    // Track currently playing animation for crossfade
    const prevAction = useRef<THREE.AnimationAction | null>(null);

    useEffect(() => {
        const action = actions[currentAnim];
        if (!action) return;

        if (prevAction.current && prevAction.current !== action) {
            action.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
            action.play();
            prevAction.current.crossFadeTo(action, 0.4, true);
        } else {
            action.reset().fadeIn(0.4).play();
        }
        prevAction.current = action;

        // Non-looping animations return to Idle when done
        const nonLooping: AnimationName[] = ['Wave', 'Punch', 'Jump', 'Death', 'ThumbsUp'];
        if (nonLooping.includes(currentAnim)) {
            const clip = THREE.AnimationClip.findByName(animations, currentAnim);
            if (clip) {
                // clip exists — handled via keyup/idle timer in parent
            }
            const onFinished = () => { /* handled via idle timer */ };
            mixer.addEventListener('finished', onFinished);
            return () => mixer.removeEventListener('finished', onFinished);
        }
    }, [currentAnim, actions, mixer, animations]);

    // Per-frame: mouse tracking via bone rotation
    const spineRef = useRef<THREE.Object3D | null>(null);
    const neckRef = useRef<THREE.Object3D | null>(null);
    const headRef = useRef<THREE.Object3D | null>(null);

    useEffect(() => {
        if (!group.current) return;
        group.current.traverse((node) => {
            const n = node.name.toLowerCase();
            if (n.includes('spine') && n.includes('2')) spineRef.current = node;
            if (n.includes('neck')) neckRef.current = node;
            if (n === 'head' || n.includes('head') && !n.includes('top') && !n.includes('site')) headRef.current = node;
        });
    }, [processedScene]);

    useFrame((state) => {
        const { x, y } = mouseNDC.current;
        const t = state.clock.elapsedTime;

        // Smooth bone rotation toward mouse
        const targetY = x * 0.4;
        const targetX = -y * 0.25;

        if (spineRef.current) {
            spineRef.current.rotation.y = THREE.MathUtils.lerp(spineRef.current.rotation.y, targetY * 0.3, 0.04);
            spineRef.current.rotation.x = THREE.MathUtils.lerp(spineRef.current.rotation.x, targetX * 0.2, 0.04);
        }
        if (neckRef.current) {
            neckRef.current.rotation.y = THREE.MathUtils.lerp(neckRef.current.rotation.y, targetY * 0.25, 0.06);
            neckRef.current.rotation.x = THREE.MathUtils.lerp(neckRef.current.rotation.x, targetX * 0.25, 0.06);
        }
        if (headRef.current) {
            headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY * 0.25, 0.08);
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX * 0.3, 0.08);
        }

        // Subtle idle sway of entire model group
        if (group.current) {
            group.current.position.y = -1.15 + Math.sin(t * 0.6) * 0.015;
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY * 0.05, 0.02);
        }
    });

    return (
        <group ref={group} position={[0, -1.15, 0]} scale={1.2}>
            {/* Rotate primitive so it faces forward without messing with group transforms */}
            <primitive object={processedScene} rotation={[0, 0, 0]} />
        </group>
    );
}

// ─── 3D: Scroll-Driven Camera ─────────────────────────────────────────────────
function ScrollCamera({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
    const { camera } = useThree();
    const basePos = useMemo(() => new THREE.Vector3(0, 1.2, 7.5), []);

    useFrame(() => {
        const s = Math.min(scrollY.current / 600, 1); // normalize to 0-1 over 600px
        // Pull back & tilt up smoothly
        const nextX = THREE.MathUtils.lerp(camera.position.x, basePos.x + s * 0.5, 0.04);
        const nextY = THREE.MathUtils.lerp(camera.position.y, basePos.y + s * 0.8, 0.04);
        const nextZ = THREE.MathUtils.lerp(camera.position.z, basePos.z + s * 2.5, 0.04);

        camera.position.set(nextX, nextY, nextZ);
        camera.lookAt(0, 1.2, 0);
    });

    return null;
}

// ─── 3D: Ground Grid ─────────────────────────────────────────────────────────
function GroundGrid() {
    return (
        <group position={[0, -1.15, 0]}>
            {/* Glowing floor ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 1.35, 64]} />
                <meshBasicMaterial
                    color="#ff2200"
                    transparent
                    opacity={0.25}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.2, 2.28, 64]} />
                <meshBasicMaterial
                    color="#0033ff"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>
            {/* Reflective floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[8, 64]} />
                <meshStandardMaterial color="#0a0a0f" metalness={0.8} roughness={0.15} />
            </mesh>
        </group>
    );
}

// ─── 3D: Full Scene ───────────────────────────────────────────────────────────
function TerminatorScene({
    mouseNDC,
    currentAnim,
    scrollY,
}: {
    mouseNDC: React.MutableRefObject<{ x: number; y: number }>;
    currentAnim: AnimationName;
    scrollY: React.MutableRefObject<number>;
}) {
    return (
        <>
            <fog attach="fog" args={['#000005', 6, 20]} />
            <CinematicLights />
            <Stars radius={80} depth={50} count={1500} factor={2.5} saturation={0} fade speed={1.5} />
            <ParticleField />
            <GroundGrid />
            <Suspense fallback={null}>
                <Environment preset="night" />
                <TerminatorModel mouseNDC={mouseNDC} currentAnim={currentAnim} />
            </Suspense>
            <ScrollCamera scrollY={scrollY} />
        </>
    );
}

// ─── UI: Key Badge ────────────────────────────────────────────────────────────
function KeyBadge({ keyChar, label, color, active }: { keyChar: string; label: string; color: string; active: boolean }) {
    return (
        <motion.div
            animate={{ scale: active ? 1.12 : 1, backgroundColor: active ? `${color}33` : 'rgba(0,0,0,0.3)' }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-1"
        >
            <div
                className="w-9 h-9 flex items-center justify-center rounded border text-xs font-bold font-mono transition-all duration-150"
                style={{
                    borderColor: active ? color : 'rgba(255,255,255,0.15)',
                    color: active ? color : 'rgba(255,255,255,0.5)',
                    boxShadow: active ? `0 0 12px ${color}88` : 'none',
                }}
            >
                {keyChar === ' ' ? 'SPC' : keyChar.toUpperCase()}
            </div>
            <span className="text-[9px] font-mono tracking-wider" style={{ color: active ? color : 'rgba(255,255,255,0.3)' }}>
                {label}
            </span>
        </motion.div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TerminatorHeroSection() {
    const mouseNDC = useRef({ x: 0, y: 0 });
    const scrollYRef = useRef(0);
    const [currentAnim, setCurrentAnim] = useState<AnimationName>('Idle');
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track scroll
    useEffect(() => {
        const onScroll = () => { scrollYRef.current = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Mouse NDC tracking
    const onMouseMove = useCallback((e: React.MouseEvent) => {
        mouseNDC.current = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -((e.clientY / window.innerHeight) * 2 - 1),
        };
    }, []);

    // Keyboard interactions
    useEffect(() => {
        const resetToIdle = () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => {
                setCurrentAnim('Idle');
                setActiveKey(null);
            }, 2500);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            const mapped = KEY_ANIMATION_MAP[k] ?? KEY_ANIMATION_MAP[e.key];
            if (!mapped) return;
            e.preventDefault();
            setCurrentAnim(mapped);
            setActiveKey(k === ' ' ? ' ' : k);
            resetToIdle();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, []);

    // Framer Motion scroll progress for hero fade/parallax
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
    const canvasScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9]);

    return (
        <section
            ref={containerRef}
            className="relative w-full min-h-screen overflow-hidden bg-black outline-none focus:outline-none"
            onMouseMove={onMouseMove}
            tabIndex={0}
        >
            {/* ── 3D Canvas Layer ── */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ scale: canvasScale }}
                onClick={() => {
                    setCurrentAnim('Wave');
                    setActiveKey('w');
                    if (idleTimer.current) clearTimeout(idleTimer.current);
                    idleTimer.current = setTimeout(() => {
                        setCurrentAnim('Idle');
                        setActiveKey(null);
                    }, 2500);
                }}
            >
                <Canvas
                    camera={{ position: [0, 1.5, 7.5], fov: 55 }}
                    dpr={[1, 1.5]}
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                >
                    <TerminatorScene
                        mouseNDC={mouseNDC}
                        currentAnim={currentAnim}
                        scrollY={scrollYRef}
                    />
                </Canvas>
            </motion.div>

            {/* ── Gradient Vignette overlay ── */}
            <div className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
                }}
            />
            {/* Bottom fade into page content */}
            <div className="absolute bottom-0 left-0 right-0 h-40 z-[1] pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, transparent, #000000)' }}
            />

            {/* ── UI Overlay ── */}
            <motion.div
                style={{ opacity: heroOpacity, y: heroY }}
                className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-16 lg:px-24 pointer-events-none"
            >
                <div className="max-w-2xl pointer-events-auto pt-32 mt-10">
                    {/* Tag */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border-l-2 border-red-500 bg-red-900/10 backdrop-blur-sm"
                    >
                        <Terminal size={12} className="text-red-400 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-red-400">
                            System Online · AI War 2026
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tight mb-6 uppercase font-mono"
                    >
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                            Deploy.
                        </span>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.65 }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600"
                            style={{ filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.5))' }}
                        >
                            Dominate.
                        </motion.span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                        className="text-sm md:text-base mb-10 h-10 text-sky-300/70"
                    >
                        <TypewriterText
                            text="Initiate telemetric sync. Submit your codebase, await judge node synchronization, and track live global rankings."
                            delay={0.9}
                        />
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                        className="flex flex-wrap gap-4 mb-14"
                    >
                        <Link
                            href="/login"
                            className="group relative inline-flex items-center gap-2 px-8 py-3.5 font-bold text-sm uppercase tracking-widest text-white overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                                border: '1px solid rgba(239,68,68,0.4)',
                            }}
                        >
                            <div className="absolute inset-0 bg-red-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="relative z-10 flex items-center gap-2">
                                Authenticate Node <ArrowRight size={16} />
                            </span>
                            {/* corner accents */}
                            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-400" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-400" />
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="group inline-flex items-center gap-2 px-8 py-3.5 font-mono font-semibold text-sm uppercase tracking-widest text-sky-400/70 hover:text-sky-300 transition-colors"
                        >
                            <Zap size={14} className="group-hover:animate-pulse" />
                            <span className="group-hover:translate-x-1 transition-transform">Access Matrix</span>
                        </Link>
                    </motion.div>

                    {/* Keyboard controls hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 2.0 }}
                        className="space-y-2"
                    >
                        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25 mb-3">
                            Interact · Control the unit
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(ANIM_LABELS).map(([k, { label, color }]) => (
                                <KeyBadge
                                    key={k}
                                    keyChar={k}
                                    label={label}
                                    color={color}
                                    active={activeKey === k}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* ── Active animation indicator ── */}
            <AnimatePresence>
                {activeKey && (
                    <motion.div
                        key={activeKey}
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-8 left-1/2 z-20 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest backdrop-blur-md"
                        style={{
                            background: `${ANIM_LABELS[activeKey]?.color}22`,
                            border: `1px solid ${ANIM_LABELS[activeKey]?.color}55`,
                            color: ANIM_LABELS[activeKey]?.color,
                            boxShadow: `0 0 20px ${ANIM_LABELS[activeKey]?.color}44`,
                        }}
                    >
                        ► {ANIM_LABELS[activeKey]?.label}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Scroll down indicator ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                style={{ opacity: heroOpacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30 pointer-events-none"
            >
                <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </motion.div>

            {/* ── Scanline overlay ── */}
            <div
                className="absolute inset-0 z-[2] pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 4px)',
                }}
            />
        </section>
    );
}
