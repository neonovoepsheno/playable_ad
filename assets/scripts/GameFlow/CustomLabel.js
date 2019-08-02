/**
 * Frame names
 * 
 *  ‘a’, b’, ‘0’ - a.png, b.png, 0.png
 *  ‘A’, ‘D’, - upper_a.png, upper_d.png,
 *  ‘.’, ‘:’, ‘!’ - pm_dot.png, pm_colon.png, pm_exclamation.png
 * 
 *  For bold prefix 'b_'
 *  */

var CustomLabel = cc.Class({
    extends: cc.Component,

    editor: {
        executeInEditMode: true,
    },

    properties: {
        //#region editors fields and properties

        atlas: {
            default: null,
            type: cc.SpriteAtlas,
        },

        autoLineHeight: {
            set(value) {
                if (this._isAutoLineHeight !== value) {
                    this._isAutoLineHeight = value;


                    if (CC_EDITOR) {
                        if (this._viewOnEditor) {
                            this._updateVisual();
                        }
                    } else {
                        this._updateVisual();
                    }
                }
            },
            get() {
                return this._isAutoLineHeight;
            },
        },

        bold: {
            set(value) {
                if (this._isBold !== value) {
                    this._isBold = value;


                    if (CC_EDITOR) {
                        if (this._viewOnEditor) {
                            this._updateVisual();
                        }
                    } else {
                        this._updateVisual();
                    }
                }
            },
            get() {
                return this._isBold;
            },
        },

        lineHeight: {
            set(value) {
                if (this._lineHeight !== value) {
                    this._lineHeight = value;


                    if (CC_EDITOR) {
                        if (this._viewOnEditor) {
                            this._updateVisual();
                        }
                    } else {
                        this._updateVisual();
                    }
                }
            },
            get() {
                return this._lineHeight;
            },
            visible: function () {
                return !this._isAutoLineHeight;
            }
        },

        viewOnEditor: {
            set(value) {
                if (this._viewOnEditor !== value) {
                    this._viewOnEditor = value;

                    for (let sprite of this._sringArray) {
                        sprite.node.destroy();
                    }

                    this._sringArray = [];

                    if (this._holderNode) {
                        this._holderNode.destroy();
                        this._holderNode = null;
                    }

                    if (value) {
                        this._updateVisual();
                    }
                }
            },
            get() {
                return this._viewOnEditor;
            },
        },

        string: {
            set(value) {
                if (this._string !== value) {
                    this._string = value.toString();

                    if (CC_EDITOR) {
                        if (this._viewOnEditor) {
                            this._updateVisual();
                        }
                    } else {
                        this._updateVisual();
                    }
                }
            },
            get() {
                return this._string;
            },
        },

        //#endregion


        //#region private field and properties

        _sringArray: [],
        _string: '',
        _lineHeight: 40,
        _isBold: false,

        _holderNode: null,
        _viewOnEditor: false,
        _isAutoLineHeight: true,

        _spaceWidth: 30,

        _nodeAnchor: new cc.Vec2(),
        
        _AtypicalAlphabet: {
            get() {
                return [{ ID: 'dot', mark: '.' }, { ID: 'colon', mark: ':' }, { ID: 'exclamation', mark: '!' },
                { ID: 'slash', mark: '/' }, { ID: 'plus', mark: '+' }];
            },
        },

        _AtypicalAnchor: {
            get() {
                return ['j', 'g', 'p', 'q', 'y'];
            },
        },

        //#endregion
    },


    //#region life-cycle callbacks

    onLoad() {
        if (!CC_EDITOR) {
            this._updateVisual();
        }

        this._resetNodeAnchorInfo();
    },

    update() {
        if (CC_EDITOR) {
            if (this._viewOnEditor) {
                this._updateVisual();
            }
        } else {
            if (this._nodeAnchor.x !== this.node.anchorX || this._nodeAnchor.y !== this.node.anchorY) {
                this._resetNodeAnchorInfo();

                this._updateVisual();
            }
        }
    },

    //#endregion 


    //#region private methods

    _resetNodeAnchorInfo() {
        this._nodeAnchor.x = this.node.anchorX;
        this._nodeAnchor.y = this.node.anchorY;
    },

    _updateVisual() {
        if (!this._holderNode) {
            this._createHolder();
        }

        const previousLength = this._sringArray.length;
        const array = this._string.split('');
        const currentLength = array.length;

        this._resetActivity();
        this._checkLength(currentLength, previousLength);
        this._resetLetters(array);
        this._resetAnchor();
    },

    _createHolder() {
        this._holderNode = new cc.Node();
        this._holderNode.parent = this.node;
        this._holderNode.name = 'Holder';

        // this._holderNode.addComponent(cc.Mask);

        this._holderNode.anchorX = 0;
        this._holderNode.anchorY = 0;
    },

    _createLetterNode() {
        const node = new cc.Node();
        const sprite = node.addComponent(cc.Sprite);

        node.parent = this._holderNode;
        this._resetLetterAnchor(node, 0);

        return sprite;
    },

    _resetLetterAnchor(node, anchor) {
        node.anchorX = 0;
        node.anchorY = anchor;
    },

    _resetActivity() {
        for (let sprite of this._sringArray) {
            sprite.node.active = true;
        }
    },

    _checkLength(currentLength, previousLength) {
        if (currentLength > previousLength) {
            const delta = currentLength - previousLength;

            for (let i = 0; i < delta; i++) {
                this._sringArray.push(this._createLetterNode());
            }
        } else if (currentLength < previousLength) {
            for (let i = currentLength; i < previousLength; i++) {
                this._sringArray[i].node.active = false;
            }
        }
    },

    _resetLetters(array) {
        let newHolderWidth = 0;
        let newHolderHeight = 0;

        for (let i = 0; i < this._sringArray.length; i++) {
            const sprite = this._sringArray[i];
            const node = sprite.node;

            if (node.active) {
                if (array[i] === ' ') {
                    this._resetSpriteFrame(node, sprite, null, 'space', this._spaceWidth);
                    node.x = newHolderWidth;
                    newHolderWidth += this._spaceWidth;
                    this._resetLetterAnchor(node, 0);
                } else {
                    let spriteFrame = this._getSpriteFrame(array[i]);

                    if (spriteFrame) {
                        this._resetSpriteFrame(node, sprite, spriteFrame, spriteFrame.name);
                        node.x = newHolderWidth;

                        node.color = this.node.color;

                        newHolderWidth += node.width;
                        newHolderHeight = Math.max(node.height, newHolderHeight);

                        if (this._AtypicalAnchor.indexOf(array[i]) !== -1) {
                            this._resetLetterAnchor(node, 0.25);
                        } else {
                            this._resetLetterAnchor(node, 0);
                        }
                    }
                }
            }
        }

        this.node.width = this._holderNode.width = newHolderWidth;
        this.node.height = this._holderNode.height = this._isAutoLineHeight ? newHolderHeight : this._lineHeight;
    },

    _resetSpriteFrame(node, sprite, spriteFrame, nodeName) {
        node.name = nodeName;

        node.active = false;
        sprite.spriteFrame = spriteFrame;
        node.active = true;
    },

    _resetAnchor() {
        this._holderNode.x = this._holderNode.width * (-this.node.anchorX);
        this._holderNode.y = this._holderNode.height * (-this.node.anchorY);
    },

    _getSpriteFrame(char) {
        if (this.atlas) {
            if (isNaN(+char)) {
                const charInfo = this._getAtypicalAlphabetMark(char);

                if (charInfo) {
                    return this.atlas.getSpriteFrame((this._isBold ? 'b_' : '') + 'pm_' + charInfo.ID);
                } else if (char === char.toUpperCase()) {
                    return this.atlas.getSpriteFrame((this._isBold ? 'b_' : '') + 'upper_' + char.toLowerCase());
                } else {
                    return this.atlas.getSpriteFrame((this._isBold ? 'b_' : '') + char);
                }
            } else {
                return this.atlas.getSpriteFrame((this._isBold ? 'b_' : '') + char);
            }
        } 
    },

    _getAtypicalAlphabetMark(char) {
        for (let punctuationMarkInfo of this._AtypicalAlphabet) {
            if (punctuationMarkInfo.mark === char) {
                return punctuationMarkInfo;
            }
        }
    },

    //#endregion 
});


//#region export

cc.CustomLabel = module.exports = CustomLabel;

//#endregion