import * as Assert from '../asledgehammer/Assert';
import { Rosetta } from '../index';

test('Create Patch', () => {
  let rosetta = new Rosetta('assets/rosetta');
  rosetta.load();

  let patch = rosetta.createPatch('test', {
    name: "Jab's Test Patch",
    version: '1.0.0',
    authors: ['Jab'],
    description: 'This is a test patch.',
    priority: 1,
  });

  Assert.assertNonNull(patch, 'patch');

  const luaFile = patch.createFile({ uri: 'lua/client/ISUI/ISUIElement', type: 'json' });
  const luaClass = luaFile.createLuaClass('ISUIElement');
  luaClass.notes = 'This is a class.';

  const { conztructor } = luaClass;
  Assert.assertNonNull(conztructor, 'conzstructor');

  conztructor.addParameter('x', 'number', 'The x coordinate. (In pixels)');
  conztructor.addParameter('y', 'number', 'The y coordinate. (In pixels)');
  conztructor.addParameter('width', 'number', 'The width. (In pixels)');
  conztructor.addParameter('height', 'number', 'The height. (In pixels)');

  const javaFile = patch.createFile({ uri: 'java/zombie/Lua/LuaManager.GlobalObject', type: 'json' });
  const javaClass = javaFile.createJavaClass('zombie.Lua', 'LuaManager.GlobalObject');
  javaClass.notes = 'Hi.';

  patch.save();

  rosetta = new Rosetta('assets/rosetta');
  rosetta.load();

  patch = rosetta.getPatch('test');
  Assert.assertNonNull(patch, 'patch');

  const loadedFile = patch.getFile('java/zombie/Lua/LuaManager.GlobalObject');
  Assert.assertNonNull(loadedFile, 'loadedFile');
});
