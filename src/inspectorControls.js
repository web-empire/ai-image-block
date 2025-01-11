import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { Button, PanelBody, PanelRow, TextareaControl } from '@wordpress/components';

/**
 * Renders the inspector controls for the block.
 *
 * @param {Object}   attributes    - The block' attributes.
 * @param {Function} setAttributes - The function to set block attributes.
 * @return {JSX.Element} The rendered inspector controls.
 */
export const EditInspectorControls = ( { attributes, setAttributes } ) => {
	const { imgUrl, prompt } = attributes;

	const [ imageBlob, setImageBlob ] = useState( null );
	const [ generationInProgress, setGenerationInProgress ] = useState( false );
	const [ savingInProgress, setSavingInProgress ] = useState( true );

	const [ imageGenerated, setImageGenerated ] = useState( false );

	/**
	 * Convert a Blob to Base64.
	 * @param {Blob} blob The image blob.
	 * @returns {Promise<string>} The Base64 string.
	 * @private
	 * @since 1.0
	 */
	const blobToBase64 = async ( blob ) => {
		return new Promise( ( resolve, reject ) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve( reader.result.split(',')[1] ); // Get Base64 without the prefix.
			reader.onerror = reject;
			reader.readAsDataURL( blob );
		});
	};

	/**
	 * Upload the image to the media library.
	 * @param {Blob} blob The image blob.
	 * @param {string} fileName The file name.
	 * @returns {Promise<*>} The media object.
	 * @private
	 * @since 1.0
	 */
	const uploadImageToMediaLibrary = async ( blob, fileName ) => {
		try {
			const formData = new FormData();
			formData.append( 'file', blob, fileName ); // Attach the binary blob with the file name.

			const response = await fetch( aiImageBlock.media_rest_url, {
				method: 'POST',
				headers: {
					'X-WP-Nonce': aiImageBlock.rest_nonce, // Only set the nonce header.
				},
				body: formData, // Send the formData object.
			});

			if ( ! response.ok ) {
				const error = await response.json();
				console.error( 'Upload error:', error );
				throw new Error('Failed to upload media.');
			}

			const media = await response.json(); // Parse the response JSON.
			return media;
		} catch ( error ) {
			console.error( 'Error uploading image:', error );
			throw error;
		}
	};

	/**
	 * Generate the image from the AI
	 * @returns {Promise<void>}
	 * @private
	 * @since 1.0
	 */
	const generateImage = async () => {
		setGenerationInProgress( true );
		const aiImageHeaders = new Headers();
		aiImageHeaders.append("content-type", "application/json");

		const response = await fetch(
			`https://s9.piclumen.art/comfy/api/generate-image`,
			{
				method: "POST",
				headers: aiImageHeaders,
				body: JSON.stringify({
					prompt: prompt
				}),
				redirect: "follow"
			}
		);
		const blob = await response.blob();
		setImageBlob( blob );

		const blobUrl = URL.createObjectURL( blob );

		setAttributes( { imgUrl: blobUrl } );
		setSavingInProgress( false );
		setImageGenerated( true );
		setGenerationInProgress( false );
	}

	/**
	 * Save the image to the server
	 * @returns {Promise<void>}
	 * @private
	 * @since 1.0
	 */
	const saveImage = async () => {
		setSavingInProgress( true );

		// Prepare filename as per the prompt.
		const filename = prompt.replace( /[^a-z0-9]/gi, '_' ).toLowerCase() + '.jpg';
		const media = await uploadImageToMediaLibrary( imageBlob, filename );

		if ( media.id ) {
			setAttributes( { imgUrl: media.source_url } );
		}

		setSavingInProgress( false );
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ __(
					'AI Image Block Settings',
					'ai-image-block'
				) }
				initialOpen={ true }
			>
				<PanelRow className='ai-image-block-textarea-wrap'>
					<TextareaControl
						label={ __( 'Enter a Prompt', 'ai-image-block' ) }
						value={ prompt }
						onChange={ ( newValue ) => {
							setAttributes( { prompt: newValue } );
						} }
					/>
					<input type="hidden" name='ai-image-block-url' value={ imgUrl } />
				</PanelRow>

				{
					prompt && (
						<>
							<PanelRow className='ai-image-block-buttons-wrap'>
								<Button
									variant="primary"
									disabled={ generationInProgress }
									onClick={ () => {
										generateImage();
									} }
									icon="update"
									iconPosition="left"
								>
									{ __(
										'Generate',
										'ai-image-block'
									) }
								</Button>
								{
									imgUrl !== aiImageBlock.image_placeholder && (
										<PanelRow className='ai-image-block-save-wrap'>
											<Button
												variant="primary"
												disabled={ savingInProgress }
												onClick={ () => {
													saveImage();
												} }
												icon="download"
												iconPosition="left"
											>
												{ __(
													'Save & Use',
													'ai-image-block'
												) }
											</Button>
										</PanelRow>
									)
								}
							</PanelRow>
						</>
					)
				}

				{
					imageGenerated && (
						<PanelRow className='ai-image-block-bmc-wrap'>
							<p className='ai-image-block-bmc-text'>
								{ __(
									'Hoping to support the plugin?',
									'ai-image-block'
								) }
								<br />
								{ __(
									'Buy me a coffee ☕️',
									'ai-image-block'
								) }
							</p>
							<a href='https://buymeacoffee.com/webempire' target='_blank' rel='noreferrer'>
								<img src={ aiImageBlock.bmc_image_url } alt='Buy Me A Coffee' />
							</a>
						</PanelRow>
					)
				}
			</PanelBody>
		</InspectorControls>
	);
};
