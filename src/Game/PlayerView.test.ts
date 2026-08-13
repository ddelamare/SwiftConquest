import { Action, Phase } from '../Domain/Model';
import { cloneGameState, createTestContext, createTestGame, placeOwnedAction } from './Game.testUtils';
import { playerView } from './Game.setup';

describe('peer-specific player views', () => {
  test('projection does not mutate authoritative state', () => {
    const G = createTestGame();
    placeOwnedAction(G, '0', Action.Attack);
    G.players['0'].bid = 4;
    const before = cloneGameState(G);
    playerView({ G, ctx: createTestContext(), playerID: '1' });
    expect(G).toEqual(before);
  });

  test('owners see their placed token while opponents see an unknown action', () => {
    const G = createTestGame();
    const { token, hex } = placeOwnedAction(G, '0', Action.Attack);
    const owner = playerView({ G, ctx: createTestContext(), playerID: '0' });
    const opponent = playerView({ G, ctx: createTestContext(), playerID: '1' });
    expect(owner.map.find((candidate) => candidate.id === hex.id)!.tokens[0].type).toBe(Action.Attack);
    expect(opponent.map.find((candidate) => candidate.id === hex.id)!.tokens[0]).toMatchObject({
      id: token.id,
      owner: '0',
      type: Action.Unknown,
    });
  });

  test('attack resolution reveals placed actions but not committed bids or hands', () => {
    const G = createTestGame();
    const { hex } = placeOwnedAction(G, '0', Action.Attack);
    G.players['0'].bid = 3;
    const view = playerView({
      G,
      ctx: createTestContext({ phase: Phase.AttackResolution }),
      playerID: '1',
    });
    expect(view.map.find((candidate) => candidate.id === hex.id)!.tokens[0].type).toBe(Action.Attack);
    expect(view.players['0'].bid).toBeNull();
    expect(view.players['0'].availableActions.every((token) => token.type === Action.Unknown)).toBe(true);
  });

  test('each player projection owns independent masked collections', () => {
    const G = createTestGame();
    const view = playerView({ G, ctx: createTestContext(), playerID: '1' });
    view.players['0'].availableActions.pop();
    view.map[0].tokens.push({ id: 'client-only', type: Action.Unknown, owner: null, rank: null });
    expect(G.players['0'].availableActions).toHaveLength(3);
    expect(G.map[0].tokens).toHaveLength(0);
  });
});
