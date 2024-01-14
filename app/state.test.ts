import { getState } from 'state';

describe('Testing state', () => {
    it('should return the game state', () => {
        const state = getState();

        expect(state?.spaceship.size).toEqual(20);
    })
});
