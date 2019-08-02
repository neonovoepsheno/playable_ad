import Events from 'Events';
import GameStates from 'GameStates';

cc.Class({
	extends: cc.Component,

	properties: {
		canvas: cc.Node,

		idleTime: 10,

		_gameState: GameStates.None,

		_idleTimer: 0,
		_isIdleActivated: false,

		_cooldownTimer: 0,
		_canTap: true,
	},

	onLoad() {
		cc.systemEvent.on(Events.REDIRECT, this.RedirectProcessing, this);
		cc.systemEvent.on(Events.SWITCH_GAME_STATE, this.onSwitchGameState, this);

		this.settings = cc.settings;
		cc.view.setResizeCallback(() => {
			this.settings.updateSettings();
			this.onSizeChange();
		});

		this.canvas.on('touchstart', (event) => {
			this.onDown(event.touch.getLocation());
		}, this);

		const physicsManager = cc.director.getPhysicsManager();
		physicsManager.enabled = true;
	},

	start() {
		this.settings.updateSettings();
		this.onSizeChange();

		cc.systemEvent.emit(Events.SWITCH_GAME_STATE, GameStates.Tutorial);
	},

	update(dt) {
		if (this._gameState === GameStates.Game) {
			if (!this._isIdleActivated) {
				this._idleTimer += dt;

				if (this._idleTimer >= this.idleTime) {
					this._isIdleActivated = true;

					cc.systemEvent.emit(Events.SHOW_TUTORIAL);
				}
			}

			if (!this._canTap) {
				this._cooldownTimer += dt;

				if (this._cooldownTimer > .1) {
					this._canTap = true;
				}
			}
		}
	},

	onSizeChange() {
		cc.systemEvent.emit(Events.SIZE_CHANGE, this.settings);
	},

	_deactivateIdleTimer() {
		this._isIdleActivated = false;
		this._idleTimer = 0;
	},

	onDown(pointerPos) {
		if (this._gameState === GameStates.Tutorial && this._canTap) {
			cc.systemEvent.emit(Events.SWITCH_GAME_STATE, GameStates.Game);
			cc.systemEvent.emit(Events.HIDE_TUTORIAL);

			cc.systemEvent.emit(Events.SHOOT);
		} else if (this._gameState === GameStates.Game && this._canTap) {
			cc.systemEvent.emit(Events.SHOOT);

			this._isIdleActivated && cc.systemEvent.emit(Events.HIDE_TUTORIAL);
			this._deactivateIdleTimer();
		} else if (this._gameState === GameStates.PostResult) {
			cc.systemEvent.emit(Events.REDIRECT);
		}

		this._canTap = false;
		this._cooldownTimer = 0;
	},

	onSwitchGameState(newState) {
		this._gameState = newState;

		switch (newState) {
			case GameStates.Tutorial:
				cc.systemEvent.emit(Events.SHOW_TUTORIAL, true);
				break;

			case GameStates.Game:
				cc.systemEvent.emit(Events.ACTIVATE_CROSSBOW);
				cc.systemEvent.emit(Events.SHOW_UI);
				break;

			case GameStates.Result:
				cc.systemEvent.emit(Events.DEACTIVATE_CROSSBOW);
				cc.systemEvent.emit(Events.SHOW_RESULT);
				break;

				
			case GameStates.PostResult:
				cc.systemEvent.emit(Events.NEXT_LEVEL);
				cc.systemEvent.emit(Events.ACTIVATE_CROSSBOW);
				cc.systemEvent.emit(Events.CLEAR_ARROWS);
				cc.systemEvent.emit(Events.HIDE_INGAME_BUTTON);
				break;
		}
	},

	RedirectProcessing() {
		cc.director.pause();

		window.open('https://play.google.com/store/apps/details?id=com.HeliosGames.ArrowsAndBloons');

		cc.director.resume();
	},
});
