//#region classes-helpers
//#endregion


const ParticleExtension = cc.Class({
	name : 'ParticleExtension',

	properties: {
		//#region editors fields and properties
		//#endregion


		//#region public fields and properties
		//#endregion


		//#region private fields and properties
		//#endregion
	},

	//#region life-cycle callbacks
	//#endregion


	//#region public methods
	//#endregion


	//#region private methods
	checkTemplate(template, data, directory) {
		for (let key in template) {
			if (template[key] && typeof template[key] === 'object') {
				this.checkTemplate(template[key], data[key], directory[key]);
			} else {
				if (data && typeof data === 'object') {
					directory[key] = typeof data[key] === typeof template[key] ? data[key] : template[key];
				} else {
					directory[key] = template[key];
				}
			}
		}
	},

	importData : CC_EDITOR && function(data) {
		for (let field of this.constructor.template) {
			let currentType = field.type;
			if (currentType instanceof Array) {
				currentType = field.type[0];

				for (let type of field.type) {
					if (typeof data[field.name] === type) {
						currentType = type;
						break;
					}
				}
			}


			if (currentType === 'object') {
				let currentView = field.view;

				if (currentView instanceof Array) {
					if (typeof data[field.name] === 'object') {
						const dataView = data[field.name] === null ? null : data[field.name].view;

						currentView = field.view[0];

						for (let view of field.view) {
							const viewName = view === null ? null : view.name;

							if (viewName === dataView) {
								currentView = view;
							}
						}		
					}
				}

				if (currentView === null) {
					this[field.name] = null;
				} else {
					if (!(this[field.name] instanceof currentView)) {
						this[field.name] = new currentView();
					}

					switch(currentView.name) {
						case 'Vec2':
						case 'Size':
							this[field.name].set(data[field.name]);
						break;

						case 'Color':
							this[field.name]._val = data[field.name]._val;
						break;

						case 'Array':
							this[field.name] = [];
							const fieldArray = this[field.name];

							for (let point of data[field.name]) {
								fieldArray.push(new field.filler(point));
							}
						break;

						default:
							this[field.name].importData(data[field.name]);
						break;
					}
				}
			} else {
				if (typeof data[field.name] === field.type) {
					this[field.name] = data[field.name];
				} else {
					this[field.name] = field.default;
				}
			}

		}
	},
	//#endregion


	//#region event handlers
	//#endregion
});

module.exports = ParticleExtension;