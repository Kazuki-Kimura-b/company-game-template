// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h2>Resource Cleaner</h2>
    <hr />
    <div>assetsフォルダ内の素材で使用していないものを抽出するツールです</div>
    <hr />
    <div>State: <span id="label">--</span></div>
    <hr />
    <ui-button id="btn">Send To Main</ui-button>
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    label: '#label',
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    this.$btn.addEventListener('confirm', () => {
      Editor.Ipc.sendToMain('resource-cleaner:clicked');
    });
  },

  // register your ipc messages here
  messages: {
    'resource-cleaner:hello' (event, args) {
      this.$label.innerText = args;//'Hello!';
    }
  }
});