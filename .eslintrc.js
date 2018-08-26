module.exports = {
	"env": {
		"browser": true,
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true,
			"jsx": true
		},
		"sourceType": "module"
	},
	"plugins": [
		"node"
	],
	"rules": {
		"indent": [
			"error",
			"tab",
			{ "SwitchCase": 1 }
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"single"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": 0,
		"node/no-extraneous-require": ["error", {
			"allowModules": []
		}],
		"node/no-missing-import": ["error", {
			"allowModules": [],
			"tryExtensions": [".js", ".json"]
		}],
		"node/no-missing-require": ["error", {
			"allowModules": [],
			"tryExtensions": [".js", ".json"]
		}],
		"node/no-unsupported-features": ["error", {
			"ignores": []
		}],
		"node/no-deprecated-api": ["error", {
			"ignoreModuleItems": [],
			"ignoreGlobalItems": []
		}]
	}
};