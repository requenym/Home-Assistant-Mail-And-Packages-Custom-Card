const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;

const curDatetime = new Date();

const datetime = curDatetime.getMonth().toString() + curDatetime.getDate().toString() + curDatetime.getFullYear().toString() + curDatetime.getHours().toString() + curDatetime.getMinutes().toString();

const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
    if (changedProps.has("_config")) {
        return true;
    }

    const oldHass = changedProps.get("hass");
    if (oldHass) {
        return (
            oldHass.states[element._config.entity] !==
            element.hass.states[element._config.entity] ||
            oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
        );
    }

    return true;
}

class MailAndPackagesCard extends LitElement {
    static get properties() {
        return {
            _config: {},
            hass: {}
        };
    }

    static async getConfigElement() {
        await import("./mail-and-packages-card-editor.js");
        return document.createElement("mail-and-packages-card-editor");
    }

    static getStubConfig() {
        return {};
    }

    setConfig(config) {
        if (!config.updated) {
            throw new Error("Please define a mail entity");
        }
        this._config = config;
    }

    shouldUpdate(changedProps) {
        return hasConfigOrEntityChanged(this, changedProps);
    }

    render() {
        if (!this._config || !this.hass) {
            return html ``;
        }

        this.numberElements = 0;

        const stateObj = this.hass.states[this._config.updated];

        if (!stateObj) {
            return html `
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.updated}
          </div>
        </ha-card>
      `;
        }

        return html `
      ${this.renderStyle()}
      <ha-card @click="${this._handleClick}">
        ${this._config.details !== false ? this.renderDetails(stateObj) : ""}
        ${this._config.image !== false ? this.renderImage(stateObj) : ""}
        <span class="usps_update">Checked: ${stateObj.state}</span>
      </ha-card>
    `;
    }

    renderDetails(stateObj) {
        const deliveries_message = this.hass.states[this._config.deliveries_message].state;
        const packages_delivered = this.hass.states[this._config.packages_delivered].state;
        const packages_in_transit = this.hass.states[this._config.packages_in_transit].state;
        const fedex_packages = this.hass.states[this._config.fedex_packages].state;
        const ups_packages = this.hass.states[this._config.ups_packages].state;
        const usps_packages = this.hass.states[this._config.usps_packages].state;
        const usps_mail = this.hass.states[this._config.usps_mail].state;

        this.numberElements++;

        return html `
      <div class="details">
        
        ${this._config.name
          ? html`
              <span class="title"> ${this._config.name} </span>
            `
          : ""}
      <div style="clear: both;">
      <br>
           <span style="float: right;"><span class="mail-iron-icon"><iron-icon icon="mdi:package-variant"></iron-icon></span>Today's Deliveries: ${packages_delivered}</span>
           <span class="mail-iron-icon"><iron-icon icon="mdi:truck-delivery"></iron-icon></span>In Transit: ${packages_in_transit}
        </div>
        <br>
        ${deliveries_message}
	    <br>
      <span>
        <ul>
           <li><span class="mail-iron-icon"><iron-icon icon="mdi:package-variant-closed"></iron-icon></span><a href="https://wwwapps.ups.com/mcdp" title="Open the UPS MyChoice site" target="_blank">UPS: ${ups_packages}</a></li>
           <li><span class="mail-iron-icon"><iron-icon icon="mdi:package-variant-closed"></iron-icon></span><a href="https://www.fedex.com/apps/fedextracking" title="Open the Fedex site" target="_blank">Fedex: ${fedex_packages}</a></li>
           <li><span class="mail-iron-icon"><iron-icon icon="mdi:email-outline"></iron-icon></span><a href="https://informeddelivery.usps.com/" title="Open the USPS Informed Delivery site" target="_blank">Mail: ${usps_mail}<a></li>
           <li><span class="mail-iron-icon"><iron-icon icon="mdi:package-variant-closed"></iron-icon></span><a href="https://informeddelivery.usps.com/" title="Open the USPS Informed Delivery site" target="_blank">USPS: ${usps_packages}</a></li><br>
        </ul>
      </span>
      
    </div>
          </div>
      
      
      
    `;
    }

    renderImage(image) {
        if (!image || image.length === 0) {
            return html ``;
        }

        const lang = this.hass.selectedLanguage || this.hass.language;

        this.numberElements++;
        return html `
      <img class="MailImg clear" src="${this._config.gif + "?v=" + datetime}" />
    `;
    }

    _handleClick() {
        fireEvent(this, "hass-more-info", {
            entityId: this._config.entity
        });
    }

    getCardSize() {
        return 3;
    }

    renderStyle() {
        return html `
      <style>
        ha-card {
          cursor: pointer;
          margin: auto;
          padding: 1em;
          position: relative;
        }

        .spacer {
          padding-top: 1em;
        }

        .clear {
          clear: both;
        }

        .title {
          position: relative;
          font-weight: 300;
          font-size: 2em;
          color: var(--primary-text-color);
        }
        .details {
          margin-bottom: .5em;
          
        }
        .details ui {
            display: flex;
          justify-content: space-between;
          }
        .mail-clear {
        clear:both;
      }
      .mail-and-packages {
        margin: auto;
        padding-top: 2em;
        padding-bottom: 2em;
        padding-left: 2em;
        padding-right:2em;
        position: relative;
      }
      .mail-iron-icon {
        height: 18px;
        padding-right: 5px;
        color: var(--paper-item-icon-color);
      }
      .mail-variations {
        font-weight:300;
        color: var(--primary-text-color);
        list-style:none;
        margin-left:-2em;
        margin-top: 1em;
      }
      .mail-variations.right {
        float: right;
        margin-left: 0;
        margin-right: 1em;
      }
      .MailImg {
        position: relative;
        width: 100%;
        height: auto;
        margin-top: 1em;
      }
      .usps_update {
	      font-size: .7em;
      }
      </style>
    `;
    }
}
customElements.define("mail-and-packages-card", MailAndPackagesCard);