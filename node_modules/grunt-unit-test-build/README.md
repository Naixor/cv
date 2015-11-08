# grunt-unit-test-build

> The Grunt plugin ever for build unit test which use seajs.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install unit-test-build --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-unit-test-build');
```

## The "unit_test_build" task

### Overview
In your project's Gruntfile, add a section named `unit_test_build` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  unit_test_build: {
    test: {
      options: {
        title: 'Your Unit Test',
        seajs: '../bower_components/seajs/dist/sea-debug.js',
        mochajs: '../bower_components/mocha/mocha.js',
        mochacss: '../bower_components/mocha/mocha.css',
        chaijs: '../bower_components/chai/chai.js'
      },
      files: {
          'unit-test.html': ['test/**/*.js', '!test/filters/filter_test.js']
      }
    }
  }
});
```

Then you can get a html file like below.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>CV Unit Test</title>
    <link rel="stylesheet" media="all" href="../bower_components/mocha/mocha.css">
  </head>
  <body>
    <div id="mocha"><p><a href=".">CV Unit Test</a></p></div>
    <div id="messages"></div>
    <div id="fixtures"></div>
    <div id='testElement'>
        <h1></h1>
    </div>
    <script src="../bower_components/mocha/mocha.js"></script>
    <script src="../bower_components/chai/chai.js"></script>
  </body>
  <script src="../bower_components/seajs/dist/sea-debug.js"></script>
  <script>
      mocha.setup("bdd");
      var testcases = ["/test/utils/each.js",
        "/test/utils/util.js",
        .
        .
        .
        ];
      seajs.use(testcases, function() {
          mocha.run();
      });
  </script>
</html>
```

### Options

#### options.title
        
Type: `String`
Default value: `Mocha Unit Test`

A string value that is used to be your title.

#### options.seajs
        
Type: `String`
Default value: `../bower_components/seajs/dist/sea-debug.js`

Path to seajs.

#### options.mochajs
        
Type: `String`
Default value: `../bower_components/mocha/mocha.js`

Path to mochajs.

#### options.mochacss
        
Type: `String`
Default value: `../bower_components/mocha/mocha.css`

Path to mochacss.

#### options.chaijs
        
Type: `String`
Default value: `../bower_components/chai/chai.js`

Path to chaijs.        

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
