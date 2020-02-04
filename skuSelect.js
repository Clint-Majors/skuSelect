import { LightningElement, track, wire, api } from 'lwc';
//import getActiveAssets from '@salesforce/apex/gen_manageUsersLightning.getActiveAssets';
import getAssets from '@salesforce/apex/gen_manageUsersLightning.getAssets';
import getAssignedAssets from '@salesforce/apex/gen_manageUsersLightning.getAssignedAssets';
import saveValueChange  from '@salesforce/apex/gen_manageUsersLightning.saveValueChange';

const MINIMAL_SEARCH_TERM_LENGTH = 3; // Min number of chars required to search
const SEARCH_DELAY = 300; // Wait 300 ms after user stops typing then, peform search

 
export default class SKU_Select extends LightningElement {
    @api recordId;
    @track options = [];
    @track assignedAssets =[];
    @track value = [];
    Assets = []; // list to preserve all availble assets when using the search functionality
    searchValue = '';
    @track ready  = false;
//Check if the component has been initiliazed and if not load the data
renderedCallback() {
    if(this.initialized) {
        return;
    }
    if(this.recordId){
        console.log('recordId:' + this.recordId);
        this.loadData();
        this.initialized = true;  
    }
    else{
        console.log('no recordId stupid');
    }    
}

//Load the Available and Assigned subscriptions(Assets) for this account by imperatively calling apex method 'getActiveAsset' & 'getAssignedAssets'
loadData(){
    getAssets({contactId: this.recordId})
        .then(result =>{
            result.forEach(({Id, Name}) => {
                let asset = { value: Id, label: Name };
                this.options.push(asset);
            });
            
            console.log ('Assets available to this user:' + JSON.stringify(this.options));
            this.Assets = this.options;
            
            getAssignedAssets({contactId: this.recordId})
            .then(result2 =>{
                result2.forEach(({Id, Name}) => {
                    let assign = { value: Id, label: Name };
                    //let assignValue = Id;
                    this.options.push(assign);
                    this.value.push(Id);
                    
                });
            
            console.log ('All assets available:' + JSON.stringify(this.options));
            console.log ('Assets that are assigned to this user:' + JSON.stringify(this.value));    
            })
        
            .catch(error => {
                this.error = error;
            })
        })
        
        .catch(error => {
            this.error = error;
        });

  
} 
/*
get selected() {
    return this.assignedAssets;
}
*/

//Event handler for the dual listbox change
handleChange(event){
    this.value = event.detail.value;

}

//If search input value is not blank then filter the asset options based on searchValue property, else display error msg 
handleSearch(event) {
   
    setTimeout(() => {
        this.ready = true;
    }, this.SEARCH_DELAY);
    this.searchValue = event.detail.value;
    console.log('Current search value: ' + this.searchValue);
    if (this.searchValue !== '' && this.searchValue.length >= MINIMAL_SEARCH_TERM_LENGTH) {   
            this.options = this.Assets.filter(
                                item => ! this.searchValue || 
                                item.value.match(this.searchValue) || 
                                item.label.match(this.searchValue));
        console.log(' ' + JSON.stringify(this.options));
            }
    else{
        this.options = this.Assets;

    }            
}   
    

        /* 
        getContactList({
                searchKey: this.sVal
            })
            .then(result => {
                // set @track contacts variable with return contact list from server  
                this.contacts = result;
            })
            .catch(error => {
                // display server exception in toast msg 
                const event = new ShowToastEvent({
                    title: 'Error',
                    variant: 'error',
                    message: error.body.message,
                });
                this.dispatchEvent(event);
                // reset contacts var with null   
                this.contacts = null;
            }); */
    
}