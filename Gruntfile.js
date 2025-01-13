module.exports = function (grunt) {
	var autoprefixer = require('autoprefixer');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			main: {
				options: {
					mode: true,
				},
				src: [
					'**',
					'!.git/**',
					'!.gitignore',
					'!.gitattributes',
					'!*.sh',
					'!*.zip',
					'!eslintrc.json',
					'!README.md',
					'!Gruntfile.js',
					'!package.json',
					'!package-lock.json',
					'!composer.json',
					'!composer.lock',
					'!phpcs.xml',
					'!phpcs.xml.dist',
					'!phpunit.xml.dist',
					'!node_modules/**',
					'!vendor/**',
					'!tests/**',
					'!scripts/**',
					'!config/**',
					'!tests/**',
					'!bin/**',
					'!src/**',
					'!interactivity/src/**',
					'!artifact/**',
					'!assets/css/unminified/**',
					'!assets/js/unminified/**',
					'!assets/src/**',
					'!phpstan.neon',
					'!phpstan-baseline.neon',
					'!tailwind.config.js',
					'!webpack.config.js',
					'!postcss.config.js',
					'!.DS_Store',
					'!phpinsights.php',
				],
				dest: 'ai-image-block/',
			},
		},
		compress: {
			main: {
				options: {
					archive: 'ai-image-block-<%= pkg.version %>.zip',
					mode: 'zip',
				},
				files: [
					{
						src: ['./ai-image-block/**'],
					},
				],
			},
		},
		clean: {
			main: ['ai-image-block'],
			zip: ['*.zip'],
		},
		bumpup: {
			options: {
				updateProps: {
					pkg: 'package.json'
				}
			},
			file: 'package.json'
		},
		replace: {
			plugin_main: {
				src: ['ai-image-block.php'],
				overwrite: true,
				replacements: [
					{
						from: /Version: \bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?(?:\+[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?\b/g,
						to: 'Version: <%= pkg.version %>'
					}
				]
			},
			plugin_readme: {
				src: ['readme.txt'],
				overwrite: true,
				replacements: [
					{
						from: /Stable tag: \bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?(?:\+[\da-z-A-Z-]+(?:\.[\da-z-A-Z-]+)*)?\b/g,
						to: 'Stable tag: <%= pkg.version %>'
					}
				]
			},
			plugin_const: {
				src: ['ai-image-block.php'],
				overwrite: true,
				replacements: [
					{
						from: /AI_IMAGE_BLOCK_VER', '.*?'/g,
						to: 'AI_IMAGE_BLOCK_VER\', \'<%= pkg.version %>\''
					}
				]
			},
			plugin_function_comment: {
				src: [
					'*.php',
					'**/*.php',
					'!node_modules/**',
					'!php-tests/**',
					'!bin/**',
					'!vendor/**',
					'!tests/**',
					'!artifact/**',
				],
				overwrite: true,
				replacements: [
					{
						from: 'x.x.x',
						to: '<%=pkg.version %>'
					}
				]
			}
        },
		wp_readme_to_markdown: {
			your_target: {
				files: {
					'README.md': 'readme.txt',
				},
			},
		},
	});

	/* Load Tasks */
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks("grunt-wp-readme-to-markdown");

	/* Generate Read MD file. */
	grunt.registerTask( 'readme', [ 'wp_readme_to_markdown' ] );

	/* Bump Version - `grunt version-bump --ver=<version-number>` */
    grunt.registerTask('version-bump', function (ver) {

        var newVersion = grunt.option('ver');

        if (newVersion) {
            newVersion = newVersion ? newVersion : 'patch';

            grunt.task.run('bumpup:' + newVersion);
            grunt.task.run('replace');
        }
    });

	/* Register task started */
	grunt.registerTask('release', [
		'clean:zip',
		'copy:main',
		'compress:main',
		'clean:main',
	]);
};
