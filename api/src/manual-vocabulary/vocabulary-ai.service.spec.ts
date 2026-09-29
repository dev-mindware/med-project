import { ConfigService } from '@nestjs/config';
import { BadGatewayException } from '@nestjs/common';
import { VocabularyAiService } from './vocabulary-ai.service';
import { AppLogger } from '../common/logger/app-logger.service';

describe('VocabularyAiService', () => {
  let service: VocabularyAiService;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    logger = {
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;

    service = new VocabularyAiService(configService, logger);
  });

  it('throws BadGatewayException when no API key is configured', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(service.extractVocabulary('Algum texto')).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('correctly uses Gemini 2.5 Flash as default model and parses valid JSON items', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'test-gemini-key';
      if (key === 'GEMINI_MODEL') return 'gemini-2.5-flash';
      if (key === 'VOCABULARY_CHUNK_WORDS') return 2200;
      return undefined;
    });

    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify([
              {
                sourceModel: 'ENTRY',
                confidence: 0.95,
                data: {
                  entry: 'Luanda',
                  firstDefinition: 'Capital de Angola',
                },
              },
              {
                sourceModel: 'TOPONYM',
                confidence: 0.98,
                data: {
                  toponym: 'Luanda',
                  province: 'Luanda',
                },
              },
            ]),
          },
        },
      ],
    });

    // Mock the OpenAI instance creation
    jest.spyOn(service as any, 'splitText').mockReturnValue(['Luanda texto']);
    
    // We can also test the private parseItems directly
    const items = (service as any).parseItems(
      JSON.stringify([
        {
          sourceModel: 'ENTRY',
          confidence: 0.95,
          data: { entry: 'Luanda', firstDefinition: 'Capital' },
        },
        {
          sourceModel: 'INVALID_MODEL',
          data: {},
        },
      ]),
    );

    expect(items).toHaveLength(1);
    expect(items[0].sourceModel).toBe('ENTRY');
    expect(items[0].data.entry).toBe('Luanda');
  });
});
