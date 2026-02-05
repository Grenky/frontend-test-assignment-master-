import { BonusScreen } from "../BonusScreen";
import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";
import { userSettings } from "../../utils/userSettings";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { RoundedBox } from "../../ui/RoundedBox";

import { Bouncer } from "./Bouncer";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  public mainContainer: Container;
  private pauseButton: FancyButton;
  private playButton: FancyButton;
  private bouncer: Bouncer;
  private balance: Label;
  private win: Label;
  private balanceBox: RoundedBox;
  private winBox: RoundedBox;
  private paused = false;


  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);
    this.bouncer = new Bouncer();

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    this.playButton = new Button({
      text: "Play",
      width: 175,
      height: 110,
    });
    this.playButton.onPress.connect(() => engine().navigation.showScreen(BonusScreen));
    this.addChild(this.playButton);

    this.balanceBox = new RoundedBox({width: 170, height: 70});
    this.addChild(this.balanceBox);

    this.winBox = new RoundedBox({width: 170, height: 70});
    this.addChild(this.winBox);

    this.balance = new Label({text: `BALANCE: \n ${userSettings.getBalance().toFixed(2)}`, style: {fill: "black"}});
    this.addChild(this.balance);

    this.win = new Label({text: `WIN: \n 0`, style: {fill: "black"}});
    this.addChild(this.win);
  }

  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    this.bouncer.update();
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {}

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.pauseButton.x = 30;
    this.pauseButton.y = 30;
    this.playButton.x = width / 2;
    this.playButton.y = height - 75;

    this.balance.x = width / 2 + 200;
    this.balance.y = height - 85;
    this.balanceBox.x = width / 2 + 200;
    this.balanceBox.y = height - 85;

    this.winBox.x = width / 2 - 200;
    this.winBox.y = height - 85;
    this.win.x = width / 2 - 200;
    this.win.y = height - 85;

    this.bouncer.resize(width, height);
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const currentBalance = userSettings.getBalance();
    const lastWin = userSettings.getLastWin();

    if(this.balance) {
      this.balance.text = `BALANCE: \n ${currentBalance.toFixed(2)}`;
    }

    if(this.balance) {
      this.win.text = `WIN: \n ${lastWin.toFixed(2)}`;
    }

    const elementsToAnimate = [
      this.pauseButton,
      this.playButton,
      this.balance,
      this.balanceBox,
      this.winBox,
      this.win,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
    this.bouncer.show(this);
  }


  /** Hide screen with animations */
  public async hide() {}

  /** Auto pause the app when window go out of focus */
  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
