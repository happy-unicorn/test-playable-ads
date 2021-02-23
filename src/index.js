import 'normalize.css';
import { Application, Container, Sprite, Graphics } from 'pixi.js';

// TODO: 'resizeTo: window'

const app = new Application({
  width: 1390,
  height: 640,
  antialias: true
});

let austin, logo, continueButton, overlay, hammer, menu, state, background, gameScene, finalScene, previousIndex;
let stairs = [], menu_items = [], direction = 1;

app.loader.add('images/homescapes.json').add('final', 'images/background_final.png').load(setup);

function setup(loader, resources) {
  const { textures } = resources['images/homescapes.json'].spritesheet;

  gameScene = new Container();
  app.stage.addChild(gameScene);

  background = new Sprite(textures['background.png']);
  gameScene.addChild(background);

  austin = new Sprite(textures['austin.png']);
  austin.anchor.set(0.5, 0.5);
  austin.position.set(gameScene.width - 500, gameScene.height / 2);
  gameScene.addChild(austin);

  let names = ['old', 'new_1', 'new_2', 'new_3'];
  for (let name of names) {
    let stair = new Sprite(textures[`stair_${name}.png`]);
    stair.visible = name === 'old';
    stair.anchor.set(0.5, 0.5);
    stair.position.set(gameScene.width - stair.width / 2, gameScene.height - stair.height / 2);
    stair.vx = 0;
    stair.vy = 0;
    stairs.push(stair);
    gameScene.addChild(stair);
  }

  menu = new Container();
  menu.visible = false;
  menu.position.set(gameScene.width - 550, 150);
  gameScene.addChild(menu);

  let items = 3, positions = [[0, 150], [135, 40], [300, 0]];
  for (let i = 0; i < items; i++) {
    let menu_item = new Container();
    menu_item.alpha = 0;
    menu_item.interactive = true;
    menu_item.on('pointerdown', onClickMenu(i));
    menu_item.position.set(positions[i][0], positions[i][1]);

    let menu_item_inactive = new Sprite(textures['menu.png']);
    menu_item.addChild(menu_item_inactive);

    let menu_item_active = new Sprite(textures['menu_selected.png']);
    menu_item_active.visible = false;
    menu_item.addChild(menu_item_active);

    let button = new Sprite(textures['button_ok.png']);
    button.interactive = true;
    button.on('pointerdown', onClickOk);
    button.visible = false;
    button.anchor.set(0.5, 0.5);
    button.position.set(menu_item.width / 2, menu_item.height + 15);
    menu_item.addChild(button);

    let menu_carpet = new Sprite(textures[`menu_carpet_${i + 1}.png`]);
    menu_item.addChild(menu_carpet);

    menu_items.push(menu_item);
    menu.addChild(menu_item);
  }

  hammer = new Sprite(textures['hammer.png']);
  hammer.anchor.set(0.5, 0.5);
  hammer.position.set(gameScene.width - 280, gameScene.height / 2 + 80);
  hammer.interactive = true;
  hammer.alpha = 0;
  hammer.visible = false;
  hammer.on('pointerdown', onClickHammer);
  gameScene.addChild(hammer);

  finalScene = new Container();
  finalScene.visible = false;
  app.stage.addChild(finalScene);

  let background_final = new Sprite(resources.final.texture);
  finalScene.addChild(background_final);

  let finalMessage = new Sprite(textures['continue.png']);
  finalMessage.anchor.set(0.5, 0.5);
  finalMessage.position.set(finalScene.width / 2, finalScene.height / 2 - 50);
  finalScene.addChild(finalMessage);

  overlay = new Container();
  app.stage.addChild(overlay);

  continueButton = new Sprite(textures['button_continue.png']);
  continueButton.anchor.set(0.5, 0.5);
  continueButton.position.set(finalScene.width / 2, finalScene.height - continueButton.height / 2 - 20);
  overlay.addChild(continueButton);

  logo = new Sprite(textures['logo.png']);
  logo.position.set(30, 30);
  overlay.addChild(logo);

  setTimeout(() => {
    hammer.visible = true;
  }, 1000);

  setInterval(() => {
    direction *= -1;
  }, 1000);

  state = play;
  app.ticker.add(delta => {
    state(delta);
  });
}

let hammerAnimationProgress = 0;

const play = (delta) => {
  if (hammer.visible && hammer.alpha < 1) {
    hammer.alpha += easeOutQuad(hammerAnimationProgress);
    hammerAnimationProgress += 0.01;
  }

  if (menu.visible) {
    menu_items.forEach((item, index, array) => {
      if (index > 0) {
        if (array[index - 1].alpha >= 1) {
          item.alpha += 0.1;
        }
      } else {
        item.alpha += 0.1;
      }
    });
  }

  stairs.forEach((stair) => {
    if (stair.position.y !== gameScene.height - stair.height / 2) {
      stair.position.y += stair.vy;
    }
  });

  continueButton.height += 0.2 * direction;
  continueButton.width += 0.4 * direction;
};

const end = (delta) => {
  continueButton.height += 0.2 * direction;
  continueButton.width += 0.4 * direction;
  finalScene.visible = true;
};

const onClickHammer = (event) => {
  hammer.visible = false;
  menu.visible = true;
};

const onClickMenu = (currentIndex) => (event) => {
  if (previousIndex !== currentIndex) {
    menu_items.forEach((item, index) => {
      if (currentIndex !== index) {
        item.children[0].visible = true;
        item.children[1].visible = false;
        item.children[2].visible = false;
      } else {
        item.children[0].visible = false;
        item.children[1].visible = true;
        item.children[2].visible = true;
      }
    });
    stairs.forEach((stair, index) => {
      if (currentIndex + 1 === index) {
        stair.position.y -= 20;
        stair.vy = 1.5;
        stair.visible = true;
      } else {
        stair.visible = false;
        stair.vy = 0;
      }
    });
  }
  previousIndex = currentIndex;
};

const onClickOk = (event) => {
  menu.visible = false;
  state = end;
};

const easeOutQuad = (x) => {
  return 1 - (1 - x) * (1 - x);
};

document.body.appendChild(app.view);