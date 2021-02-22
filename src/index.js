import 'normalize.css';
import { Application, Container, Sprite, Graphics } from 'pixi.js';

// TODO: 'resizeTo: window'

const app = new Application({
  width: 1390,
  height: 640,
  antialias: true
});

let austin, logo, continueButton, overlay, hammer, menu, stairs, state, background, gameScene, finalScene;

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

  stairs = [];

  let names = ['old', 'new_1', 'new_2', 'new_3'];
  for (let name of names) {
    let stair = new Sprite(textures[`stair_${name}.png`]);
    stair.visible = name === 'old';
    stair.anchor.set(0.5, 0.5);
    stair.position.set(gameScene.width - stair.width / 2, gameScene.height - stair.height / 2);
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

    menu.addChild(menu_item);
  }

  hammer = new Sprite(textures['hammer.png']);
  hammer.anchor.set(0.5, 0.5);
  hammer.position.set(gameScene.width - 280, gameScene.height / 2 + 80);
  hammer.interactive = true;
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


  state = play;
  app.ticker.add(delta => {
    state(delta);
  });
}

let direction = 1;
setInterval(() => {
  direction *= -1;
}, 1000);

const play = (delta) => {
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

const onClickMenu = (current_index) => (event) => {
  menu.children.forEach((item, index) => {
    if(current_index === index) {
      item.children[0].visible = false;
      item.children[1].visible = true;
      item.children[2].visible = true;
    } else {
      item.children[0].visible = true;
      item.children[1].visible = false;
      item.children[2].visible = false;
    }
  });
  stairs.forEach((stair, index) => {
    console.log(stair);
    stair.visible = current_index + 1 === index;
  });
};

const onClickOk = (event) => {
  menu.visible = false;
  state = end;
};

document.body.appendChild(app.view);