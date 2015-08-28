define(function(require, exports, module) {
	var BoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || _boundaryFillColor > 255) {
			return;
		}
		this.boundaryFillColor = _boundaryFillColor;
	}

	BoundaryFillColor.getBoundaryFillColor = function() {
		return boundaryFillColor;
	}
	BoundaryFillColor.setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || _boundaryFillColor > 255) {
			return;
		}
		this.boundaryFillColor = _boundaryFillColor;
	}
	return new BoundaryFillColor(127);
});