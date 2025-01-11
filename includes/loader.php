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
		add_action( 'init', [ $this, 'init' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_block_editor_assets' ] );
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
