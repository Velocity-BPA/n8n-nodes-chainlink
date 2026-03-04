import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ChainlinkApi implements ICredentialType {
	name = 'chainlinkApi';
	displayName = 'Chainlink API';
	documentationUrl = 'https://docs.chain.link/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description: 'API key for Chainlink services (required for certain operations)',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chain.link/v1',
			required: true,
			description: 'Base URL for Chainlink API',
		},
	];
}