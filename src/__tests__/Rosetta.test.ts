import { Rosetta } from '../index';

// test('PZ-Rosetta', () => {
//   const rosetta = new Rosetta('assets/rosetta');
//   rosetta.load();
// });

test('Create Patch', () => {
  const rosetta = new Rosetta('assets/rosetta');

  const patch = rosetta.createPatch('test', {
    name: "Jab's Test Patch",
    version: '1.0.0',
    authors: ['Jab'],
    description: 'This is a test patch.',
    priority: 1,
  });

  const file = patch.createFile({ uri: 'lua/client/ISUI/ISUIElement', type: 'json' });
  const clazz = file.createLuaClass('ISUIElement');
  clazz.notes = 'This is a class.';

  const { conztructor } = clazz;
  conztructor.addParameter('x', 'number', 'The x coordinate. (In pixels)');
  conztructor.addParameter('y', 'number', 'The y coordinate. (In pixels)');
  conztructor.addParameter('width', 'number', 'The width. (In pixels)');
  conztructor.addParameter('height', 'number', 'The height. (In pixels)');

  patch.save();
});
