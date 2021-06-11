//-----------------------------------------------------
//
// 値の変化をトゥイーンで取得できる。UnityのDOTweenでいうDOVirtual.To()みたいなもの
// nodeのプロパティが関係ないので初期値が必要。
// 変化時にcallbackから値が取れる。
//
//
// cc.valutTo(時間, 初期値, 変化する増加量, 値変化時のコールバック)
//
// 使用例:
//   this.node.runAction(cc.valueBy(2, 100, 200, (value) => { cc.log("V:" + value); }).easing(cc.easeBackOut()));
//   this.node.runAction(cc.valueTo(2, 100, 200, (value) => { cc.log("V:" + value); }).easing(cc.easeBackOut()));
//
//-----------------------------------------------------

cc.ValueBy = cc.Class({
	name: 'cc.ValueBy',
	extends: cc.ActionInterval,

	ctor: function (duration, currentValue, deltaValue, callback)
	{
		this._valueDelta = 0;
		this._startValue = 0;
		this._previousValue = 0;

		deltaValue !== undefined && cc.ValueBy.prototype.initWithDuration.call(this, duration, currentValue, deltaValue, callback);
	},

	initWithDuration: function (duration, currentValue, deltaValue, callback)
	{
		if (cc.ActionInterval.prototype.initWithDuration.call(this, duration))
		{
			this._currentValue = currentValue;
			this._callback = callback;
			this._valueDelta = deltaValue;
			return true;
		}
		return false;
	},

	clone: function ()
	{
		var action = new cc.ValueBy();
		this._cloneDecoration(action);
		action.initWithDuration(this._duration, this._currentValue, this._valueDelta, this._callback);
		return action;
	},

	startWithTarget: function (target)
	{
		cc.ActionInterval.prototype.startWithTarget.call(this, target);
		var v = this._currentValue;
		this._previousValue = v;
		this._startValue = v;
	},

	update: function (dt)
	{
		dt = this._computeEaseTime(dt);
		if (this.target)
		{
			var v = this._valueDelta * dt;
			var locStartValue = this._startValue;
			if (cc.macro.ENABLE_STACKABLE_ACTIONS)
			{
				var targetVal = this._currentValue;
				var locPreviousValue = this._previousValue;

				locStartValue = locStartValue + targetVal - locPreviousValue;
				v = v + locStartValue;
				locPreviousValue = v;

				//callback
				this._callback(v);
			}
			else
			{
				this._callback(locStartValue + v);
			}
		}
	},

	reverse: function ()
	{
		var action = new cc.ValueBy(this._duration, this._currentValue, this._valueDelta, this._callback);
		this._cloneDecoration(action);
		this._reverseEaseList(action);
		return action;
	},
});


cc.valueBy = function (duration, currentValue, deltaValue, callback)
{
	return new cc.ValueBy(duration, currentValue, deltaValue, callback);
}


//----------------------------------------------------------


cc.ValueTo = cc.Class({
	name: 'cc.ValueTo',
	extends: cc.ValueBy,

	ctor: function (duration, currentValue, toValue, callback)
	{
		this._endValue = 0;
		currentValue !== undefined && this.initWithDuration(duration, currentValue, toValue, callback);
	},

	initWithDuration: function (duration, currentValue, toValue, callback)
	{
		if (cc.ValueBy.prototype.initWithDuration.call(this, duration, currentValue, toValue, callback))
		{
			this._endValue = toValue;
			return true;
		}
		return false;
	},

	clone: function ()
	{
		var action = new cc.ValueTo();
		this._cloneDecoration(action);
		action.initWithDuration(this._duration, this._currentValue, this._endValue, this._callback)
	},

	startWithTarget: function (target)
	{
		cc.ValueBy.prototype.startWithTarget.call(this, target);
		this._valueDelta = this._endValue - this._currentValue;
	},
});


cc.valueTo = function (duration, currentValue, toValue, callback)
{
	return new cc.ValueTo(duration, currentValue, toValue, callback);
};

