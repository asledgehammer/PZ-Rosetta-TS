import { Rosetta } from '../index';

// test('PZ-Rosetta', () => {
//   const rosetta = new Rosetta('assets/rosetta');
//   rosetta.load();
// });

test('Create Patch', () => {
  const rosetta = new Rosetta('assets/rosetta');
  rosetta.load();

  const patch = rosetta.createPatch('test', {
    name: "Jab's Test Patch",
    version: '1.0.0',
    authors: ['Jab'],
    description: 'This is a test patch.',
    priority: 1,
  });

  const luaFile = patch.createFile({ uri: 'lua/client/ISUI/ISUIElement', type: 'json' });
  const luaClass = luaFile.createLuaClass('ISUIElement');
  luaClass.notes = 'This is a class.';

  const { conztructor } = luaClass;
  conztructor.addParameter('x', 'number', 'The x coordinate. (In pixels)');
  conztructor.addParameter('y', 'number', 'The y coordinate. (In pixels)');
  conztructor.addParameter('width', 'number', 'The width. (In pixels)');
  conztructor.addParameter('height', 'number', 'The height. (In pixels)');

  const javaFile = patch.createFile({ uri: 'java/zombie/Lua/LuaManager.GlobalObject', type: 'json' });
  const javaClass = javaFile.createJavaClass('zombie.Lua', 'LuaManager.GlobalObject');
  javaClass.notes = 'Hi.';

  patch.save();
});
