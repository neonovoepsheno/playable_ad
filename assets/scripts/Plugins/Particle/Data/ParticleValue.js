import ParticleExtension from 'ParticleExtension'

const {ccclass, property} = cc._decorator;

//#region classes-helpers
var ValueType = cc.Enum({
	Value: 0,
	MinMax: 10,
});


const MinMaxValueHelper = @ccclass('MinMaxValueHelper')
class MinMaxValueHelper extends ParticleExtension {
	constructor(...args) {
		super();

		this.min = typeof args[0] === 'number' ? args[0] : 0;
		this.max = typeof args[1] === 'number' ? args[1] : 1;
	}

	@property(Number) min = 0;
	@property(Number) max = 1;

	get data() {
		return this.min + Math.random() * (this.max - this.min);
	}
};
//#endregion


const ParticleValue = @ccclass('ParticleValue')
class ParticleValue extends ParticleExtension {
	constructor(...args) {
		super();

		this.defaultValue = typeof args[0] === 'number' ? args[0] : 1;
		this.defaultMin = typeof args[1] === 'number' ? args[1] : 1;
		this.defaultMax = typeof args[2] === 'number' ? args[2] : this.defaultMin;

		this.value = this.defaultValue;
	}

	@property _valueType = ValueType.Value;
	@property({ type : ValueType, }) get valueType() { return this._valueType; };
	@property({ type : ValueType, }) set valueType(value) {
		if (this._valueType !== value) {
			this._valueType = value;
			switch(this._valueType) {
				case ValueType.MinMax : {
					this.value = new MinMaxValueHelper(this.defaultMin, this.defaultMax);
				} break;

				default : {
					this.value = this.defaultValue;
				} break;
			}
		}
	};

	@property() value = null;

	get data() {
		if (this.value instanceof Object) return this.value.data;

		return this.value;
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleValue',
			_valueType: this._valueType,
			value: this.value,
		};

		if (this._valueType === ValueType.MinMax) {
			data.value.view = 'MinMaxValueHelper';
		}
		return data
	};
};

if (CC_EDITOR) {
	MinMaxValueHelper.template = [
		{ name: 'min', type: 'number', default: 0, },
		{ name: 'max', type: 'number', default: 1, },
	];
	ParticleValue.template = [
		{ name: '_valueType', type: 'number', default: 0, },
		{ name: 'value', type: ['number', 'object'], default: 1, view: MinMaxValueHelper, },
	];
}

module.exports = ParticleValue;
