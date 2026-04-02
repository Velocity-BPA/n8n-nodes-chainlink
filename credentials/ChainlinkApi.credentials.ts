import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ChainlinkApi implements ICredentialType {
	name = 'chainlinkApi';
	displayName = 'Chainlink API';
	documentationUrl = 'https://docs.chain.link/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'API key for Chainlink API authentication. Get your API key from the Chainlink developer portal.',
			required: true,
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chain.link',
			description: 'Base URL for the Chainlink API',
			required: true,
		},
	];
}