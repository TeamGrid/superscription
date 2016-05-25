Package.describe({
  name: 'teamgrid:superscription',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Sophisticated subscription handling for meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/teamgrid/superscription.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'ecmascript',
    'tracker',
    'reactive-var',
    'underscore',
  ]);
  api.mainModule('main.js', 'client')
});
