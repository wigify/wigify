(function () {
  var WORDS = [
    'ephemeral',
    'serendipity',
    'melancholy',
    'perspicacious',
    'eloquent',
    'sycophant',
    'ubiquitous',
    'pernicious',
    'luminous',
    'stoic',
    'labyrinth',
    'zenith',
    'cacophony',
    'ethereal',
    'tangential',
    'vicarious',
    'soliloquy',
    'oblivion',
    'paradox',
    'enigmatic',
    'quixotic',
    'catharsis',
    'axiom',
    'nonchalant',
    'furtive',
  ];

  var wordEl = document.getElementById('word');
  var defEl = document.getElementById('definition');
  var exampleEl = document.getElementById('example');
  var posEl = document.getElementById('pos');
  var phoneticEl = document.getElementById('phonetic');

  var idx = Math.floor(Date.now() / 86400000) % WORDS.length;

  function loadWord(word) {
    wordEl.textContent = word;
    defEl.textContent = '...';
    exampleEl.textContent = '';

    fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!Array.isArray(data) || !data.length) return;
        var entry = data[0];
        var meanings = entry.meanings || [];
        var phonetics = entry.phonetics || [];

        var phonetic =
          entry.phonetic || '' || (phonetics[0] && phonetics[0].text) || '';
        phoneticEl.textContent = phonetic;

        if (!meanings.length) return;
        var meaning = meanings[0];
        posEl.textContent = meaning.partOfSpeech || 'word';

        var defs = meaning.definitions || [];
        if (defs.length) {
          defEl.textContent = defs[0].definition || '';
          exampleEl.textContent = defs[0].example
            ? '"' + defs[0].example + '"'
            : '';
        }
      })
      .catch(function () {
        defEl.textContent = 'Could not load definition.';
      });
  }

  window.nextWord = function () {
    idx = (idx + 1) % WORDS.length;
    loadWord(WORDS[idx]);
  };

  loadWord(WORDS[idx]);
})();
