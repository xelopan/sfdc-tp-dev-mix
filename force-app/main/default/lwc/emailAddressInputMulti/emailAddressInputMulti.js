import { LightningElement, api, track } from 'lwc';
import searchEmailAddress from '@salesforce/apex/NotifyActivityCtrl.searchEmailAddress';

export default class EmailAddressInputMulti extends LightningElement {
    @api getContact = false;
    @api getUser = false;
    @api label;
    @api
    get addresses() {
        return this.pillItems.map((el) => {
            return el.name;
        });
    }

    @track pillItems = [];
    @track matchedItems = [];
    @track searchTerm;

    get inputId() {
        return this.id + 'InputEl';
    }

    get inputPlaceholder() {
        let objects = [];
        let result = 'Search ';
        if(this.getContact) {
            objects.push('Contact');
        }

        if(this.getUser) {
            objects.push('User');
        }

        for(let i = 0; i < objects.length; i++) {
            if(i == objects.length - 1 && objects.length > 1) {
                result += ' and ' + objects[i];
            } else if(objects.length > 1) {
                result += objects[i];
                if(i < objects.length - 2) {
                    result += ', ';
                }
            } else {
                result = 'Enter email address'
            }
        }
        return result;
    }

    get arePillsShown() {
        return this.pillItems.length;
    }

    error;
    inputTimer = 0;
    inputBlurTimer = 0;
    isDropdownOpen = false;

    connectedCallback() {
        this.addressValues = [];
    }

    handleInputKeyUp(e) {
        clearTimeout(this.inputTimer);
        if(e.key === 'Enter') { // immediately add the value from the input to the pills when hitting enter
            let newAddress = e.target.value;
            // only add the new address if it hasn't been added yet
            if(!this.pillItems.find(el => el.name === newAddress)) {
                this.addAddress({ Email: newAddress });
            }
            // cleanup
            e.target.value = '';
            this.closeDropdown();
        } else { // make expensive request to the server trying to find matching contact / user
            this.searchTerm = e.target.value;
            this.inputTimer = setTimeout(() => {
                // call server action to search the term in the database
                searchEmailAddress({
                    searchTerm: this.searchTerm,
                    getContact: this.getContact,
                    getUser: this.getUser
                })
                .then((result) => {
                    let tempResult = [];
                    result.forEach(v => {
                        // filter out previously selected items from the result set
                        if(!this.pillItems.find(el => el.name === v.Email)) {
                            let newV = {...v};
                            if(v.type === 'Contact') {
                                newV.icon = 'standard:contact';
                            }
                            if(v.type === 'User') {
                                newV.icon = 'standard:user';
                            }
                            tempResult.push(newV);
                        }
                    });
                    this.matchedItems = tempResult;
                    this.error = undefined;
                    if(this.matchedItems.length) {
                        this.openDropdown();
                    } else {
                        this.closeDropdown();
                    }
                })
                .catch((error) => {
                    this.matchedItems = [];
                    this.error = undefined;
                    this.closeDropdown();
                });
            }, 350);
        }
    }

    handleInputBlur(e) {
        // delay the dropdown closing to give time for the selection event to be fired
        clearTimeout(this.inputBlurTimer);
        this.inputBlurTimer = setTimeout(() => {
            this.closeDropdown();
        }, 300);
    }

    handleInputFocus(e) {
        if(this.matchedItems.length) {
            this.openDropdown();
        }
    }

    handlePillRemove(e) {
        const addressToRemove = e.detail.item.name;
        this.removeAddress(addressToRemove);
    }

    handleMatchItemSelect(e) {
        const selectedId = e.currentTarget.dataset.id;
        const selectedItem = this.matchedItems.find((el) => {
            return el.Id === selectedId;
        });
        this.addAddress(selectedItem);

        this.matchedItems = [];
        this.template.querySelector('[data-id="' + this.inputId + '"]').value = '';
    }

    addAddress(newAddress) {
        let iconName = 'standard:email';
        if(newAddress.type == 'Contact') {
            iconName = 'standard:contact';
        }
        if(newAddress.type == 'User') {
            iconName = 'standard:user';
        }
        this.pillItems.push({
            type: 'icon',
            label: newAddress.Name ? newAddress.Name : newAddress.Email,
            name: newAddress.Email,
            iconName: iconName,
            alternativeText: newAddress.type ? newAddress.type : 'Email'
        });

        // notify parent for the change in the addresses list
        this.dispatchEvent(new CustomEvent('addresseschanged', {
            detail: this.addresses
        }))
    }

    removeAddress(addressToRemove) {
        const index = this.addressValues.indexOf(addressToRemove);
        // this.addressValues.splice(index,1);
        const pillItemIndex = this.pillItems.findIndex(el => {
            return el.name === addressToRemove;
        });
        
        this.pillItems.splice(pillItemIndex, 1);

        // notify parent for the change in the addresses list
        this.dispatchEvent(new CustomEvent('addresseschanged', {
            detail: this.addresses
        }))
    }

    openDropdown() {
        this.template.querySelector('[data-id="toOpen"]').classList.add('slds-is-open');
    }

    closeDropdown() {
        this.template.querySelector('[data-id="toOpen"]').classList.remove('slds-is-open');
    }
}