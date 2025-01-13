<?php
/**
 * Plugin Loader.
 *
 * @package ai-image-block
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class AI_Image_Block_Loader {
	/**
	 * Plugin instance.
	 *
	 * @var AI_Image_Block_Loader
	 */
	protected static $instance = null;

	/**
	 * Main AI_Image_Block_Loader Instance.
	 *
	 * Ensures only one instance of AI_Image_Block_Loader is loaded or can be loaded.
	 *
	 * @return AI_Image_Block_Loader
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Initialize the plugin.
	 */
	private function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize the plugin hooks.
	 */
	private function init_hooks() {
		add_action( 'init', [ $this, 'load_textdomain' ] );
		add_action( 'init', [ $this, 'init' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
	}

	/**
	 * Load Plugin Text Domain.
	 * This will load the translation textdomain depending on the file priorities.
	 *      1. Global Languages /wp-content/languages/ai-image-block/ folder
	 *      2. Local directory /wp-content/plugins/ai-image-block/languages/ folder
	 *
	 * @since 0.0.1
	 * @return void
	 */
	public function load_textdomain(): void {
		// Default languages directory.
		$lang_dir = AI_IMAGE_BLOCK_PATH . 'languages/';

		/**
		 * Filters the languages directory path to use for plugin.
		 *
		 * @param string $lang_dir The languages directory path.
		 */
		$lang_dir = apply_filters( 'ai_image_block_languages_directory', $lang_dir );

		// Traditional WordPress plugin locale filter.
		global $wp_version;

		$get_locale = get_locale();

		if ( $wp_version >= 4.7 ) {
			$get_locale = get_user_locale();
		}

		/**
		 * Language Locale for plugin
		 *
		 * Uses get_user_locale()` in WordPress 4.7 or greater,
		 * otherwise uses `get_locale()`.
		 */
		$locale = apply_filters( 'plugin_locale', $get_locale, 'ai-image-block' );//phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- wordpress hook
		$mofile = sprintf( '%1$s-%2$s.mo', 'ai-image-block', $locale );

		// Setup paths to current locale file.
		$mofile_global = WP_LANG_DIR . '/plugins/' . $mofile;
		$mofile_local  = $lang_dir . $mofile;

		if ( file_exists( $mofile_global ) ) {
			// Look in global /wp-content/languages/ai-image-block/ folder.
			load_textdomain( 'ai-image-block', $mofile_global );
		} elseif ( file_exists( $mofile_local ) ) {
			// Look in local /wp-content/plugins/ai-image-block/languages/ folder.
			load_textdomain( 'ai-image-block', $mofile_local );
		} else {
			// Load the default language files.
			load_plugin_textdomain( 'ai-image-block', false, $lang_dir );
		}
	}

	/**
	 * Initialize the plugin.
	 */
	public function init() {
		/**
		 * Registers the block using the metadata loaded from the `block.json` file.
		 * Behind the scenes, it registers also all assets so they can be enqueued
		 * through the block editor in the corresponding context.
		 *
		 * @see https://developer.wordpress.org/reference/functions/register_block_type/
		 */
		register_block_type_from_metadata( AI_IMAGE_BLOCK_PATH . 'build' );
	}

	/**
	 * Enqueue block editor only JavaScript and CSS.
	 */
	public function enqueue_block_editor_assets() {
		wp_localize_script(
			'ai-image-block-ai-image-block-editor-script',
			'aiImageBlock',
			[
				'rest_nonce'        => wp_create_nonce( 'wp_rest' ),
				'image_placeholder' => esc_url( AI_IMAGE_BLOCK_URL . 'assets/placeholder.jpg' ),
				'bmc_image_url'     => esc_url( AI_IMAGE_BLOCK_URL . 'assets/bmc.png' ),
				'media_rest_url'    => rest_url( 'wp/v2/media' ),
			]
		);
	}
}

/**
 * Main instance of AI_Image_Block_Loader. Kick-off the plugin.
 */
AI_Image_Block_Loader::instance();
