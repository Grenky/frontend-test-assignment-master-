import { Container, Text, TextStyle, Sprite, Assets } from "pixi.js";

const sliceUrl = new URL("../../../raw-assets/main{m}/base{tps}/wheelSlice.png", import.meta.url).href;

export class Wheel extends Container {
    constructor(prizes: {value: string} []) {
        super();
        this.init(prizes);
    }

    private async init(prizes: {value: string}[]) {

        const safePrizes = prizes || [];
        const sectorsCount = safePrizes.length;

        if(sectorsCount === 0) {
            console.warn("Wheel initiazed width 0 prizes!");
            return;
        }

        try{
            const sliceTexture = await Assets.load(sliceUrl);
            const angleStep = (Math.PI * 2) / sectorsCount;



            for(let i = 0; i < sectorsCount; i++) {
                const slice = new Sprite(sliceTexture);
                slice.anchor.set(0.5, 1);
                slice.rotation = i * angleStep;
                this.addChild(slice);

                const label = new Text({
                    text: prizes[i].value,
                    style: {
                        fill:"#ffffff",
                        fontSize: 44,
                        fontWeight: "bold",
                        stroke: { color: "#000000", width: 4 }
                    }
                })
                label.anchor.set(0.5);
                label.y = -350;
                slice.addChild(label);
            }
        } catch (e) {
            console.error("failed build wheel from slices", e);
        } 
    }
}