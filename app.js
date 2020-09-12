

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.cart-close');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');


// CART 
let cart = [];
// buttons
let buttonsDOM = []
// GETTING THE PRODUCT
class Products {
    async getProducts(){
        try{
            let result = await fetch("products.json")
            let data = await result.json()

            let products = data.items;
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products
        }
        catch (error){
            console.log(error);
        }
    }
}

// DISPLAY PRODUCTS
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result +=`
            <!-- single products -->
            <article class="product">
             <div class="img-container">
                 <img class="product-img" src="${product.image}"alt="product">
                 <button class="bag-btn" data-id="${product.id}">
                     <i class="fas fa-shopping-cart"></i>
                     add to bag
                 </button>
             </div>
             <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>
            <!-- single products -->
            `
        })
        productDOM.innerHTML = result
    }
    getBagBtns(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener('click',(event) => {
                event.target.innerText = "In Cart"
                event.target.disabled = true;
                // Get product form products
                let cartItem = {...storage.getProduct(id), amaunt: 1};
                // Add product to the cart
                cart = [...cart, cartItem];
                // Save cart to the local storage
                storage.saveCart(cart)
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            })
        })
    }
    setCartValues(cart){
        let tempTotal = 0
        let itemTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amaunt;
            itemTotal += item.amaunt
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src="${item.image}" alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="romove-item" data-id="${item.id}">remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id="${item.id}"></i>
            <p class="${item.amaunt}">1</p>
            <i class="fas fa-chevron-down" data-id="${item.id}"></i>
        </div>`
        cartContent.append(div)
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    setupAPP(){
        cart = storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        })
        // Button functionality
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains("romove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild 
                (removeItem.parentElement.parentElement);

                this.removeItem(id);
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmaunt = event.target;
                let id = addAmaunt.dataset.id
                console.log(addAmaunt);
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to bag`
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

// LOCAL STORAGE
class storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products()
    // setup application
    ui.setupAPP();
    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        storage.saveProducts(products)
    }).then( () => {
        ui.getBagBtns();
        ui.cartLogic();
    });
    cartOverlay.addEventListener('click', () => {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    })
})