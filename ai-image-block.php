<?php
/**
 * Plugin Name: AI Image Block
 * Plugin URI: https://webempire.org.in/
 * Description: AI Image Block is a WordPress block that allows you to get an image from AI as per your prompt.
 * Author: AI Image Block
 * Author URI: https://webempire.org.in/
 * Version: 0.0.1
 * Requires PHP: 5.6
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ai-image-block
 * Domain Path: /languages
 *
 * @package ai-image-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Set constants
 */
define( 'AI_IMAGE_BLOCK_VER', '0.0.1' );
define( 'AI_IMAGE_BLOCK_FILE', __FILE__ );
define( 'AI_IMAGE_BLOCK_PATH', plugin_dir_path( AI_IMAGE_BLOCK_FILE ) );
define( 'AI_IMAGE_BLOCK_URL', plugins_url( '/', AI_IMAGE_BLOCK_FILE ) );

/**
 * Load plugin files
 */
require_once AI_IMAGE_BLOCK_PATH . 'includes/loader.php';
