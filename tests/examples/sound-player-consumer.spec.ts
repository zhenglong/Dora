import SoundPlayer from './sound-player';
import SoundPlayerConsumer from './sound-player-consumer';
const mockPlaySoundFile = jest.fn();
jest.mock('./sound-player', () => {
    return jest.fn().mockImplementation(() => {
        return {
            playSoundFile: mockPlaySoundFile
        };
    });
});

beforeEach(() => {
    (SoundPlayer as jest.Mock).mockClear();
});

it('We can check if the consumer called the class constructor', () => {
    const soundPlayerConsumer = new SoundPlayerConsumer();
    expect(SoundPlayer).toHaveBeenCalledTimes(1);
});

it('We can check if the consumer called a method on the class instance', () => {
    const soundPlayerConsumer = new SoundPlayerConsumer();
    const coolSoundFileName = 'song.mp3';
    soundPlayerConsumer.playSomethingCool();
    expect(mockPlaySoundFile).toHaveBeenCalledWith(coolSoundFileName);
});

describe('When SoundPlayer throws an error', () => {
    beforeEach(() => {
        (SoundPlayer as jest.Mock).mockImplementationOnce(() => {
            return {
                playSoundFile: () => {
                    throw new Error('Test error');
                }
            };
        });
    });

    it('Should throw an error when callign playSomethingCool', () => {
        const soundPlayerConsumer = new SoundPlayerConsumer();
        expect(() => soundPlayerConsumer.playSomethingCool()).toThrow();
    });
});