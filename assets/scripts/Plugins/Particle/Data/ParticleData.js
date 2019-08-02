import ParticleExtension from 'ParticleExtension'

import ParticleValue from 'ParticleValue'
import ParticleCurve from 'ParticleCurve'


const {ccclass, property} = cc._decorator;
const ParticleData = @ccclass('ParticleData')
class ParticleData extends ParticleExtension {
	constructor() { super(); }

	@property({editorOnly: true, }) EDITING = true; 

	@property({ type: ParticleValue, visible() { return this.EDITING; }, }) initialValue = new ParticleValue();
	@property({ type: ParticleCurve, visible() { return this.EDITING; }, }) control = new ParticleCurve();

	get data() {
		return {
			initial: this.initialValue.data,
			control: this.control.data,
		}
	};

	exportData = CC_EDITOR && function() {
		const data = {
			view: 'ParticleData',
			initialValue: this.initialValue.exportData(),
			control: this.control.exportData(),
		};

		return data;
	};
};

if (CC_EDITOR) {
	ParticleData.template = [
		{ name: 'initialValue', type: 'object', view: ParticleValue, },
		{ name: 'control', type: 'object', view: ParticleCurve, },
	];
}


module.exports = ParticleData;