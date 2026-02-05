import { Container, Sprite, Assets, AnimatedSprite } from "pixi.js"; 
import { animate } from "motion";
import { Wheel } from "./Wheel";
import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { userSettings } from "../utils/userSettings";
import wheelPointerUrl from "../../../raw-assets/main{m}/base{tps}/wheelPointer.png";

const bgUrl = new URL("../../../raw-assets/main{m}/base{tps}/bg.png", import.meta.url).href;
const coinAnimPath = new URL("../../../raw-assets/main{m}/base{tps}/coin-anim.json", import.meta.url).href;
const wheelCenterUrl = new URL("../../../raw-assets/main{m}/base{tps}/wheelCenter.png", import.meta.url).href;
const raysUrl = new URL("../../../raw-assets/main{m}/base{tps}/effects/rays.jpg", import.meta.url).href;
const glowUrl = new URL("../../../raw-assets/main{m}/base{tps}/effects/glow.jpg", import.meta.url).href;
const prtclUrl = new URL("../../../raw-assets/main{m}/base{tps}/effects/prtcl.jpg", import.meta.url).href;
const ringUrl = new URL("../../../raw-assets/main{m}/base{tps}/effects/ring.jpg", import.meta.url).href;

export class BonusScreen extends Container {
    public static assetBundles = ["main"];

    private wheel: Wheel;
    private center: Sprite;
    private spinButton: Button;
    private pointer: Sprite; 
    private isSpinning = false;
    private winText: Label;
    private rays: Sprite;
    private glow: Sprite;
    private ring: Sprite;
    private instructionText: Label;

    private prizes = [
        { value: "2.00", weight: 200 },
        { value: "50.00", weight: 76 },
        { value: "500.00", weight: 12 },
        { value: "2.00", weight: 200 },
        { value: "100.00", weight: 62 },
        { value: "50.00", weight: 81 },
        { value: "2.00", weight: 200 },
        { value: "75.00", weight: 74 },
    ];

    constructor() {
        super();

        this.bg = new Sprite();
        this.addChild(this.bg);

        // Wheel
        this.wheel = new Wheel(this.prizes);
        this.addChild(this.wheel);

        // Pointer
        this.pointer = new Sprite(); 
        this.pointer.anchor.set(0.5);
        this.pointer.visible = false; 
        this.addChild(this.pointer);

        // Button
        this.spinButton = new Button({
            text: "SPIN",
            width: 150,
            height: 80,
        });
        this.spinButton.onPress.connect(() => this.startSpin());
        this.addChild(this.spinButton);


        this.instructionText = new Label({
            text: "Press to spin",
            style: { 
                fontSize: 30,
                fill: "#ffffff",
                fontWeight: "bold",
                stroke: {color: "#000000", width: 2}
            } 
        });
        this.addChild(this.instructionText);

        this.winText = new Label({
            text: "",
            style: { fill: "#ffffff", fontSize: 90, fontWeight: "bold", stroke: { color: "#000000", width: 4 }}
        });
        this.winText.alpha = 0;
        this.addChild(this.winText);
    }

    private async startSpin() {
        if (this.isSpinning) return;
        this.isSpinning = true;

        animate(this.instructionText, {alpha: 0}, {duration: 0.3});

        animate(this.glow, { alpha: 0 }, { duration: 0.5 });
        this.rays.alpha = 0;
        this.rays.scale.set(0);

        const prizeIndex = this.getWeightedPrizeIndex();
        const sectorsCount = 8;
        const fullCircles = 5;
        const sectorAngle = (Math.PI * 2) / sectorsCount;

        const randomOffset = (Math.random() * 0.6 - 0.3) * sectorAngle;
        this.wheel.rotation %= Math.PI * 2;

        const targetRotation = (Math.PI * 2 * fullCircles) + (prizeIndex * sectorAngle) + randomOffset;
        

        await animate(
            this.wheel,
            { rotation: -targetRotation },
            { duration: 4, ease: [0.12, 0, 0.33, 1] }
        );

        await Promise.all([
            this.playCoinExplosion(),
            this.playParticleExplosion()
        ])

        const winValue = this.prizes[prizeIndex].value;
        const winAmount = parseFloat(winValue);

        this.winText.text = `YOU WON: ${winAmount}`;
        this.winText.x = this.wheel.x;
        this.winText.y = this.wheel.y;
        this.winText.alpha = 1;
        this.addChild(this.winText);

        userSettings.addBalance(winAmount);
        userSettings.setLastWin(winAmount);

        animate(this.winText, { scale: [0.5, 1.2, 1], alpha: 1 }, { duration: 0.5 });

        this.rays.x = this.wheel.x;
        this.rays.y = this.wheel.y;
        animate(this.rays, {alpha: 0.9, scale: 8 }, { duration: 1 });
        animate(this.rays, { rotation: Math.PI * 2 }, {duration: 10, repeat: Infinity});

        this.isSpinning = false;
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        engine().navigation.showScreen(MainScreen);
    }

    private async playParticleExplosion() {
        const texture = await Assets.load(prtclUrl);
        const container = new Container();
        this.addChildAt(container, this.getChildIndex(this.wheel) + 1);
        container.x = this.wheel.x;
        container.y = this.wheel.y;

        for(let i = 0; i < 40; ++i) {
            const p = new Sprite(texture);
            p.anchor.set(0.5);
            p.blendMode = 'screen';
            p.scale.set(Math.random() * 1.5 + 0.8);
            p.alpha = 1;
            container.addChild(p);

            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 300;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            animate(p, 
                {x: tx,
                y: ty,
                rotation: Math.PI * 2,
                alpha: [1, 1, 0], scale: [1, 1.2, 0]}, {
                duration: 4 + Math.random() * 1, ease: "linear"
            });
        }
        setTimeout(() => container.destroy(), 7000);
    }

    private getWeightedPrizeIndex(): number {
        const totalWeight = this.prizes.reduce((acc, p) => acc + p.weight, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < this.prizes.length; i++) {
            if (random < this.prizes[i].weight) return i;
            random -= this.prizes[i].weight;
        }
        return 0;
    }


    public resize(width: number, height: number) {
        if (this.bg) {
        this.bg.width = width;
        this.bg.height = height;
    }

        const centerX = width / 2;
        const centerY = height / 2;

        this.wheel.x = centerX;
        this.wheel.y = centerY;
        this.wheel.scale.set(0.7);

        this.pointer.x = centerX;
        this.pointer.y = centerY - 340; 

        this.spinButton.x = width / 2;
        this.spinButton.y = height - 50;

        this.winText.x = width / 2;
        this.winText.y = height / 2;

        if(this.instructionText) {
            this.instructionText.x = centerX;
            this.instructionText.y = this.spinButton.y - 70;
        }

        if (this.center) {
            this.center.x = centerX;
            this.center.y = centerY;
            this.center.scale.set(0.35);
        }

        if(this.rays) {
            this.rays.x = width / 2;
            this.rays.y = height / 2;
        }

        if(this.glow) {
            this.glow.x = centerX;
            this.glow.y = centerY;
        }
        
        if(this.ring) {
            this.ring.x = centerX;
            this.ring.y = centerY;
            this.ring.scale.set(0.85);
        }
    }

    private startGlowPulse() {
        animate(
            this.glow,
            {
                alpha: [0.3, 0.5, 0.3],
                scale: [4.8, 5.2, 4.8]
            },
            {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        )
    }

    public async show() {
        this.winText.alpha = 0;
        this.isSpinning = false;

        try{
            const texture = await Assets.load(wheelPointerUrl);
            this.pointer.texture = texture;
            this.pointer.visible = true;

            const bgTexture = await Assets.load(bgUrl);
            this.bg.texture = bgTexture;
            
            const centerTexture = await Assets.load(wheelCenterUrl);
            this.center = new Sprite(centerTexture);
            this.center.anchor.set(0.5);
            this.addChild(this.center);
            
            await Assets.load(prtclUrl);

            const raysTexture = await Assets.load(raysUrl);
            this.rays = new Sprite(raysTexture);
            this.rays.anchor.set(0.5);
            this.rays.blendMode = 'screen';
            this.rays.alpha = 0;
            this.rays.scale.set(0);
            this.rays.texture.baseTexture.scaleMode = 'linear';
            this.addChildAt(this.rays, 1);

            const glowTexture = await Assets.load(glowUrl);
            this.glow = new Sprite(glowTexture);
            this.glow.anchor.set(0.5);
            this.glow.blendMode = 'screen';
            this.glow.alpha = 0.5;
            this.glow.scale.set(2.5);
            this.addChildAt(this.glow, this.getChildIndex(this.rays) + 1);

            const ringTexture = await Assets.load(ringUrl);
            this.ring = new Sprite(ringTexture);
            this.ring.anchor.set(0.5);
            this.ring.blendMode = "screen";
            this.addChild(this.ring);

            this.startGlowPulse();
            this.resize(engine().screen.width, engine().screen.height);
        } catch (e) {
            console.error(e);
        }
    }
    public async hide() {}

    public async playCoinExplosion() {
        try {
            if(!Assets.cache.has('coinAnim')) {
                Assets.add({alias: 'coinAnim', src: coinAnimPath});
            }
            const sheet = await Assets.load('coinAnim');
            const animName = sheet.animations["coin"] ? "coin" : Object.keys(sheet.animations)[0];
            const anim = new AnimatedSprite(sheet.animations[animName]);

            anim.anchor.set(0.5);
            anim.x = this.wheel.x;
            anim.y = this.wheel.y;
            anim.scale.set(0);
            anim.animationSpeed = 0.2;
            anim.loop = true;
            this.addChild(anim);
            anim.parent.setChildIndex(anim, anim.parent.children.length - 1);
            animate(anim,
                {scale: [0, 1.8, 1.5]},
                {duration: 0.6, ease: "easeOut"}
            );
            let loopCount = 0;
            const targetLoops = 4;

            anim.onLoop = () => {
                loopCount++;
                if(loopCount >= targetLoops) {
                    anim.stop();
                    animate(anim,
                        {alpha: 0, scale: 2.5},
                        {duration: 0.6, ease: "easeIn"}
                    ).then(() => {
                        anim.destroy();
                    });
                }
            };

            anim.play();

            anim.onComplete = () => {
                anim.destroy();
                console.log("animation finished and removed");
            };
        } catch (e) {
            console.error("failed to play coin animation", e);
        }
    }
}

import { MainScreen } from "./main/MainScreen";
import { Label } from "../ui/Label";


