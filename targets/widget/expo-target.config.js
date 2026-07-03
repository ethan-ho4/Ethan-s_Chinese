/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'EthansChineseWidget',
  displayName: "Ethan's Chinese",
  icon: '../../assets/icon.png',
  frameworks: ['SwiftUI', 'WidgetKit'],
  entitlements: {
    'com.apple.security.application-groups': ['group.com.ethanho.ethanschinese'],
  },
});
