import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchesTag, tagPath } from '../../src/lib/index/tag-hierarchy.ts';
import {
  canAssignSecondary,
  crossSections,
  secondaryOptions,
  validateClassification,
  validateContentIds,
  validateTagDefinitions,
} from '../../src/lib/index/taxonomy-rules.ts';

test('artifacts and experiments share the approved work types, including future photos', () => {
  const expected = ['article', 'composition', 'exercises', 'game', 'crossword', 'graphics',
    'comic', 'photo', 'lyrics', 'poem', 'nursery-rhyme', 'repository'].sort();
  for (const primary of ['artifact', 'experiment']) {
    assert.deepEqual([...secondaryOptions(primary)].sort(), expected);
    assert.equal(canAssignSecondary(primary, 'composition'), true);
    assert.equal(canAssignSecondary(primary, 'playlist'), false);
    // Renderer kinds are not automatically public Index categories.
    assert.equal(canAssignSecondary(primary, 'audio'), false);
    assert.equal(canAssignSecondary(primary, 'image'), false);
  }
});

test('collections allow playlists; projects, fragments, thoughts and notes have no subtype', () => {
  assert.deepEqual(secondaryOptions('collection'), ['playlist']);
  assert.equal(canAssignSecondary('collection', 'playlist'), true);
  assert.equal(canAssignSecondary('collection', 'poem'), false);
  for (const primary of ['project', 'fragment', 'thought', 'note']) {
    assert.deepEqual(secondaryOptions(primary), []);
    assert.equal(canAssignSecondary(primary, ''), true);
    assert.equal(canAssignSecondary(primary, 'poem'), false);
  }
});

test('All is a filter state, not a content type', () => {
  assert.equal(secondaryOptions('').includes('poem'), true);
  assert.equal(secondaryOptions('').includes('playlist'), true);
  assert.equal(matchesTag('secondary', '', []), true);
  assert.equal(canAssignSecondary('', 'poem'), false);
  assert.deepEqual(secondaryOptions('unknown'), []);
});

test('parent filters include descendants without including siblings or unrelated tags', () => {
  for (const [group, parent, child] of [
    ['secondary', 'game', 'crossword'],
    ['secondary', 'graphics', 'comic'],
    ['secondary', 'poem', 'nursery-rhyme'],
    ['cross', 'mathematics', 'topology'],
    ['cross', 'mathematics', 'mathematical-analysis'],
    ['cross', 'mathematics', 'set-theory'],
  ]) {
    assert.deepEqual(tagPath(group, child), [parent, child]);
    assert.equal(matchesTag(group, parent, [child]), true);
    assert.equal(matchesTag(group, child, [parent]), false);
  }
  assert.equal(matchesTag('secondary', 'graphics', ['photo']), false);
  assert.equal(matchesTag('cross', 'topology', ['set-theory']), false);
  assert.equal(matchesTag('cross', 'literature', ['translation']), false);
  assert.equal(matchesTag('cross', 'image', ['image']), true);
});

test('invalid classifications fail with the content ID and offending tag', () => {
  const valid = { id: 'sample-work', primary: 'artifact', secondary: 'poem', cross: ['translation'] };
  assert.doesNotThrow(() => validateClassification(valid));
  for (const primary of ['', 'All', 'unknown']) {
    assert.throws(() => validateClassification({ ...valid, primary }), /Unknown primary.*sample-work/);
  }
  assert.throws(() => validateClassification({ ...valid, secondary: 'audio' }), /Unknown secondary "audio".*sample-work/);
  assert.throws(() => validateClassification({ ...valid, primary: 'project' }), /poem.*not allowed.*project.*sample-work/);
  assert.throws(() => validateClassification({ ...valid, primary: 'collection' }), /poem.*not allowed.*collection/);
  assert.throws(() => validateClassification({ ...valid, cross: ['unregistered'] }), /unregistered.*sample-work/);
});

test('hierarchies reject missing parents, self references and longer cycles', () => {
  assert.doesNotThrow(() => validateTagDefinitions({ parent: {}, child: { parent: 'parent' } }, 'test'));
  assert.throws(() => validateTagDefinitions({ child: { parent: 'missing' } }, 'test'), /Unknown parent "missing"/);
  assert.throws(() => validateTagDefinitions({ self: { parent: 'self' } }, 'test'), /Cycle/);
  assert.throws(() => validateTagDefinitions({ a: { parent: 'b' }, b: { parent: 'c' }, c: { parent: 'a' } }, 'test'), /Cycle/);
});

test('cross-cutting roots have a section; descendants inherit it', () => {
  assert.doesNotThrow(() => validateTagDefinitions({ math: { section: 'Topics' }, topology: { parent: 'math' } }, 'cross', ['Topics']));
  assert.throws(() => validateTagDefinitions({ math: {} }, 'cross', ['Topics']), /Invalid section/);
  assert.throws(() => validateTagDefinitions({ math: { section: 'Other' } }, 'cross', ['Topics']), /Invalid section/);
  assert.throws(() => validateTagDefinitions({ math: { section: 'Topics' }, topology: { parent: 'math', section: 'Topics' } }, 'cross', ['Topics']), /Invalid section/);
  assert.deepEqual(crossSections.map(section => section.label), ['Topics', 'Media', 'Features']);
  assert.deepEqual(crossSections.find(section => section.label === 'Media')?.values, ['image']);
  assert.equal(crossSections.flatMap(section => section.values).includes('topology'), false);
});

test('editorial assignments cannot refer to a missing content ID', () => {
  const known = new Set(['retained-work', 'draft-work']);
  assert.doesNotThrow(() => validateContentIds(['retained-work', 'draft-work'], known, 'assignments'));
  assert.throws(() => validateContentIds(['retained-work', 'removed-work'], known, 'assignments'), /removed-work.*assignments/);
});
