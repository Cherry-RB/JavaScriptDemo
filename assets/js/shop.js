/*
            商城範例
*/
let products = [
    {
        'id': 1,
        'title': '哈利波特: 神秘的魔法石',
        'price': 250,
        'thumbnail': 'images/harryPotter-1.webp'
    },
    {
        'id': 2,
        'title': '哈利波特: 消失的密室',
        'price': 280,
        'thumbnail': 'images/harryPotter-2.webp'
    },
    {
        'id': 3,
        'title': '哈利波特: 阿茲卡班的逃犯',
        'price': 299,
        'thumbnail': 'images/harryPotter-3.webp'
    }
];
let shop = {
    'allProducts': [],
    'addToCartButtons': null, // 由於此按鈕現在是被 js 加到 HTML 中的, 稍後在 getElements() 中再選擇

    'cartToggle': document.getElementById('cart-toggle'), // 選擇 #cart-toggle, 即展開/關閉購物車的 button
    'productsContainer': document.getElementById('products-container'), // 選擇 #products-container, 即裝有商品的 div
    'addedProductsContainer': document.getElementById('added-products-container'), // 選擇 #added-products-container, 即裝有購物車中商品的 div
    'cartAmount': document.getElementById('cart-amount'), // 選擇 #cart-amount, 即裝有購物車中商品數量的 span
    'cartSubtotal': document.getElementById('cart-subtotal'), // 選擇 #cart-subtotal, 即裝有購物車中商品總價的 span

    'checkoutButton': document.getElementById('checkout-button'), // 最後送出購物車中商品的按鈕
    'cookieName': 'cartItems',
    'cookieContent': {
        'items': [],
        'itemsAmount': []
    },

    'urls': {
        'getProducts': 'https://cart-handler.weihaowang.work/api/products',
        'submit': 'https://cart-handler.weihaowang.work/api/cartHandler'
    },
    'cart': {
        'items': [],  // 加入購物車的商品的 id
        'itemsAmount': [],
        'subtotal': 0, // 加入購物車的商品的總價
        'amount': 0    // 加入購物車的商品的數量
    },
    'removeCarItem': function () {
        //移出購物車按鈕
        this.removeCarButton = document.getElementsByClassName("remove-to-cart-button");

        for (let i = 0; i < this.removeCarButton.length; i++) {
            this.removeCarButton[i].addEventListener("click", function (event) {

                const clickButton = event.target;
                //獲得被刪除的那筆資料的product id
                let removeParent = clickButton.parentNode;
                let removeIdString = removeParent.getAttribute("id");
                let removeIdNumber = removeIdString.replace("cart-product-", "");
                let idNumber = parseInt(removeIdNumber);
                //在html上刪除資料
                removeParent.remove();
                console.log("被點擊了移除!移除的item id為" + idNumber)

                //在this.cart的陣列資料中(items、itemsAmount)刪除那筆資料
                //==>(先找到其id在cart.items中的對應index)
                let removeIndex = this.cart.items.indexOf(idNumber);

                //在cart.items陣列中刪除
                let former1 = this.cart.items.slice(0, removeIndex);
                let back1 = [];
                if (this.cart.items.length - 1 >= removeIndex + 1) {
                    back1 = this.cart.items.slice(removeIndex + 1);
                }
                this.cart.items = former1.concat(back1);
                console.log(this.cart.items);

                //在cart.itemsAmount陣列中刪除
                let former2 = this.cart.itemsAmount.slice(0, removeIndex);
                let back2 = [];
                if (this.cart.itemsAmount.length - 1 >= removeIndex + 1) {
                    back2 = this.cart.itemsAmount.slice(removeIndex + 1);
                }
                this.cart.itemsAmount = former2.concat(back2);
                console.log(this.cart.itemsAmount);

                //重刷cookie
                this.cookieContent.items = this.cart.items;
                this.cookieContent.itemsAmount = this.cart.itemsAmount;
                setCookie(this.cookieName, JSON.stringify(this.cookieContent));

                ////在cart.subtotal、cart.amount中減去該資料
                //==>先獲得該資料product的價位與個數
                this.cart.subtotal -= this.allProducts[idNumber].price * this.cart.itemsAmount;
                this.cart.amount -= this.cart.itemsAmount;

                console.log("移除後，更新cookie")

            }.bind(this))
        }
    },
    'searchInput': document.getElementById("searchInput"),
    'searchButton': document.getElementById("searchButton"),
    'init': function (productsInCookie) {
        console.log("跑一次init")
        this.fetchProducts();
        this.renderElements();
        this.getElements();
        this.addListeners();
        if (productsInCookie) {
            // 如果有存在 cookie 的商品 id...
            /* 
                8.
                productsInCookie 為已經入購物車的商品 id 的陣列, 
                我們可以用 for 迴圈來檢視此陣列中的每個值, 
                現在要呼叫 shop 的哪個方法來把有這些 id 的商品加入購物車?
                */
            console.log("productsInCookie=" + productsInCookie);

            let long = productsInCookie.items.length;
            console.log("long=" + long);
            for (let i = 0; i < long; i++) {
                console.log("有抵達這!");
                // this.updateCart(productsInCookie[i]);
                // console.log("productsInCookie[i]" + productsInCookie[i]);
                // for (let i = 0; i < productsInCookie.items.length; i++) {
                //     this.updateCart(productsInCookie.items[i], productsInCookie.itemsAmount[i]);
                console.log("productsInCookie.items[i]" + productsInCookie.items[i]);
                console.log("productsInCookie.itemsAmount[i]" + productsInCookie.itemsAmount[i]);
                this.updateCart(productsInCookie.items[i], productsInCookie.itemsAmount[i])
            }
        }
        let explainCheck = document.getElementById("explainCheck");
        let wrap = document.getElementById("wrap");
        if (explainCheck) {
            explainCheck.addEventListener("click", () => {
                wrap.classList.toggle("hidden");
            })
        }

    },
    'renderElements': function () {
        console.log("跑一次renderElements")
        /*
            1.
            對 this.allProducts 使用 for 迴圈
            將以下商品 HTML 的模板加入 this.productsContainer 中
            記得將「書名」, 「縮圖」, 「價格」, 「商品id」換成正確的值 
        */
        /*
        `<div class="product" id="product-`+(i+1)+`">
            <div class="product-thumbnail-wrapper"><img class="product-thumbnail" src="` + 縮圖 + `"></div>
            <div class="product-name">` + 書名 + `</div>
            <div class="product-price-wrapper"><span class="product-price">`+價格+`</span> 元</div>
            <button class="add-to-cart-button" productId = "`+商品id+`">加入購物車</button>
        </div>`
        */
        for (let i = 0; i < this.allProducts.length; i++) {
            this.productsContainer.innerHTML +=
                `<div class="product" id="product-` + (i + 1) + `">
                        <div class="product-thumbnail-wrapper"><img class="product-thumbnail" src="` + this.allProducts[i].thumbnail + `"></div>
                        <div class="product-name">` + this.allProducts[i].title + `</div>
                        <div class="product-price-wrapper"><span class="product-price">`+ this.allProducts[i].price + `</span> 元</div>
                        <input type="number" class="each-amount" placeholder="數量">
                        <button class="add-to-cart-button" productId = "`+ this.allProducts[i].id + `">加入購物車</button>
                    </div>`;
        }

    },
    'getElements': function () {
        console.log("跑一次getElements")
        this.addToCartButtons = {
            'ids': document.getElementsByClassName('add-to-cart-button'),
            'eachAmount': document.getElementsByClassName('each-amount'),
        }
    },
    'addListeners': function () {
        console.log("跑一次addListeners")
        /*
            2
            如同前一個練習, 對 this.addToCartButtons 使用 for 迴圈 
            按下「加入購物車」按鈕時呼叫 this.updateCart(), 但這次要傳入商品id
            商品 id 在 this.renderElements() 中被存為按鈕的 HTML Attribute "productId"
            如何得到 HTML Attribute?
        */
        let inputNumber;
        for (let i = 0; i < this.addToCartButtons.ids.length; i++) {

            // console.log("有成功進入到1，this.addToCartButtons為" + this.addToCartButtons);
            // console.log(this.addToCartButtons.ids[i], this.addToCartButtons.eachAmount[i]);

            // this.addToCartButtons.eachAmount[i].addEventListener("input", function () {
            //     inputNumber = this.addToCartButtons.eachAmount[i].value;
            // }.bind(this))

            this.addToCartButtons.ids[i].addEventListener("click", function () {
                inputNumber = this.addToCartButtons.eachAmount[i].value;
                if (inputNumber > 0) {//當數量輸入框中有輸入正整數時

                    let productId = this.addToCartButtons.ids[i].getAttribute("productId");
                    let eachProductAmount = inputNumber;

                    console.log("我收到id為" + productId + ",數量為" + eachProductAmount)
                    this.updateCart(productId, eachProductAmount);
                }

            }.bind(this));

        }
        /*
            3
            當按下 this.cartToggle 時, body 加上 "viewing-cart" 這個 class
            再次按下 this.cartToggle 時, body 移除 "viewing-cart" 這個 class...
        */
        this.cartToggle.addEventListener("click", function () {
            document.body.classList.toggle("viewing-cart");
        })
        if (this.searchButton) {
            this.searchButton.addEventListener("click", function () {
                let keyWord = this.searchInput.value;
                let productAll = document.getElementsByClassName("product");
                if (keyWord) {
                    for (let i = 0; i < productAll.length; i++) {

                        let target = 'class="product-name">';
                        let formerIndex = productAll[i].innerHTML.indexOf(target) + target.length;
                        let formerPart = productAll[i].innerHTML.slice(formerIndex);

                        target = '</div>';
                        let backIndex = formerPart.indexOf(target);
                        let bookTitle = formerPart.slice(0, backIndex);
                        // console.log(bookTitle);

                        if (!bookTitle.includes(keyWord)) {
                            productAll[i].classList.add("hidden");
                        } else {
                            productAll[i].classList.remove("hidden");
                        }

                    }
                } else {
                    alert("請輸入想要搜尋的關鍵字");
                    for (let i = 0; i < productAll.length; i++) {
                        productAll[i].classList.remove("hidden");
                    }
                }
            }.bind(this));

        };

        if (this.checkoutButton) {
            this.checkoutButton =
                this.checkoutButton.addEventListener('click', function () {
                    this.submit();
                }.bind(this));
        }

    },
    'updateCart': function (p_id, p_amount) {

        console.log("跑一次updateCart")
        p_id = parseInt(p_id);
        p_amount = parseInt(p_amount);

        console.log("updateCart()");
        console.log("p_id=" + p_id + ", p_amount=" + p_amount);

        /*
            對 this.allProducts 使用 for 迴圈 
    `   */
        for (let i = 0; i < this.allProducts.length; i++) {
            if (this.allProducts[i].id == p_id) {

                //存入this.cart中：
                //if the id have not exited in cart
                if (this.cart.items.indexOf(p_id) == -1) {

                    this.cart.items.push(p_id);
                    this.cart.itemsAmount.push(p_amount);

                } else { //if the id have exited in cart
                    let itemsIndex = this.cart.items.indexOf(p_id);
                    // console.log("找到的itemsIndex=" + itemsIndex);
                    let a = parseInt(this.cart.itemsAmount[itemsIndex]);
                    this.cart.itemsAmount[itemsIndex] = a + p_amount;
                    // console.log("新增後的cart.itemsAmount=" + this.cart.itemsAmount)
                }

                console.log("跑一次updateCart：有跑完存入this.cart")

                //處理排序：=====================================
                //  使用 map 存取this.cart.items陣列中的id與index
                // console.log("cart.items=" + this.cart.items);
                // console.log("cart.itemsAmount=" + this.cart.itemsAmount);
                //  1.建立新陣列存取id與對應index
                let indexArray = this.cart.items.map(function (id, index) {
                    return { id: id, index: index };
                })
                //  2.新陣列：用id對物件進行排序
                //      =>目標：排序後的indexArray.index
                //          舉例：
                //          {(id:3,index:0),(id:5,index:1),(id:1,index:2)}
                //          ->{(id:1,index:2),(id:3,index:0),(id:5,index:1)}
                //          indexArray.index=[2,0,1]，對應到原來的index
                indexArray.sort(function (a, b) {
                    return a.id - b.id;
                })
                //  3.重新排序this.cart.items與this.cart.itemsAmount
                this.cart.items = indexArray.map((item) => {
                    return this.cart.items[item.index];
                })
                this.cart.itemsAmount = indexArray.map((item) => {
                    return this.cart.itemsAmount[item.index];
                })
                // console.log("cart.items=" + this.cart.items);
                // console.log("cart.itemsAmount=" + this.cart.itemsAmount);
                //完成排序處理!!!======================================

                console.log("跑一次updateCart：有跑完this.cart的排序處理")


                /* 
                    4.1
                    如果 p_id 等於 this.allProducts[i] 的 id
                    更新 this.cart.items, this.cart.subtotal, this.cart.amount
                */
                this.cart.subtotal += this.allProducts[i].price * p_amount;
                this.cart.amount += p_amount;
                console.log("跑一次updateCart：有跑完subtotal與amount的更新")
                /* 
                    4.2
                    呼叫 this.updateCartUI(), 並將商品名稱跟價格傳進去
                */
                console.log("this.cart.items.length=" + this.cart.items.length)
                this.updateCartUI(this.allProducts[i].title, this.allProducts[i].price, p_id, p_amount);

                console.log("跑一次updateCart：有跑完呼叫updateCartUI()")

                /* 
                    6.
                    更新 cookie 
                    用 setCookie() 將 this.cart.items 存在 cookie 中
                    由於 cookie 的值只能是字串, 我們這裡會使用 JSON.stringify(this.cart.items) 來將陣列準換成文字且保留其格式
                    cookie 名稱儲存在 this.cookieName
                */
                this.cookieContent.items = this.cart.items;
                this.cookieContent.itemsAmount = this.cart.itemsAmount;
                setCookie(this.cookieName, JSON.stringify(this.cookieContent));
                console.log("跑一次updateCart：有跑完cookie的更新");
                console.log("this.cookieContent.items=" + this.cookieContent.items);
                console.log("this.cookieContent.itemsAmount=" + this.cookieContent.itemsAmount);

                break;
            }

        }
        console.log(this.cart);
    },
    'updateCartUI': function (p_name, p_price, p_id, p_amount) {
        console.log("跑一次updateCartUI")
        // console.log(p_name, p_price, p_id, p_amount);
        // 更新購物車的 UI
        /*
        5.1
        將以下商品 HTML 的模板加入 this.addedProductsContainer 中
        記得將「商品名稱」, 「價格」換成傳入的參數 
        */

        /*
        `<div class="added-product">
        <span class="added-product-title">` + 商品名稱 + `</span>
        <span class="added-product-price">` + 價格 + `</span>
        </div>`
        */

        let htmlStringRange = this.addedProductsContainer.innerHTML;
        let target = `<div class="added-product" id="cart-product-${p_id}">`;
        console.log(target);

        console.log("跑一次updateCartUI：進入判斷是否存在購物車中")

        if (htmlStringRange.includes(target)) {
            console.log("已經存在購物車!")

            //先獲得原有的amount
            //  1.獲得該product的html起點
            let productIndex = htmlStringRange.indexOf(target);
            let stringLength = target.length;
            let productPart = htmlStringRange.slice(productIndex + stringLength);
            //  2.獲得amount的html起點
            let startIndex = productPart.indexOf(`"added-product-amount">`);
            let stringLength2 = `"added-product-amount">`.length;
            let formerPart = productPart.slice(startIndex + stringLength2);
            console.log("formerPart=" + formerPart);
            //  3.只留amount數值，切除後半部不需要的html
            let endIndex = formerPart.indexOf(`</span>`);
            let oldAmount = formerPart.slice(0, endIndex);
            oldAmount = parseInt(oldAmount);
            console.log("oldAmount=" + oldAmount);

            //cart html的變更

            //  1.新增：
            let oldProductElement = document.getElementById(`cart-product-${p_id}`);

            let newProductElement = document.createElement("div");
            newProductElement.classList.add("added-product");
            newProductElement.id = `cart-product-${p_id}`;

            let span1 = document.createElement("span");
            span1.classList.add("added-product-id");
            newProductElement.appendChild(span1);
            span1.innerText = p_id;

            let span2 = document.createElement("span");
            span2.classList.add("added-product-title");
            newProductElement.appendChild(span2);
            span2.innerText = p_name;

            let span3 = document.createElement("span");
            span3.classList.add("added-product-price");
            newProductElement.appendChild(span3);
            span3.innerText = p_price;

            let span4 = document.createElement("span");
            span4.classList.add("added-product-amount");
            newProductElement.appendChild(span4);
            span4.innerText = oldAmount + p_amount;

            let button1 = document.createElement("button");
            button1.classList.add("remove-to-cart-button");
            button1.innerText = "移出購物車";
            newProductElement.appendChild(button1);

            //  2.切除舊有的：
            let parent = oldProductElement.parentNode;
            parent.replaceChild(newProductElement, oldProductElement);

            // productPart = htmlStringRange.slice(productIndex);
            // console.log("productPart=" + productPart);

            // productPart.innerHTML +=
            //     `<div class="added-product" id="cart-product-${p_id}">
            //                 <span class="added-product-id">`+ p_id + `</span>
            //                 <span class="added-product-title">` + p_name + `</span>
            //                 <span class="added-product-price">` + p_price + `</span>
            //                 <span class="added-product-amount">` + (oldAmount + p_amount) + `</span>
            //                 <button class="remove-to-cart-button" remove-product-id="`+ removeProductId + `">移出購物車</button>
            //             </div>`
            // cartProductHtml.remove();


        } else {
            console.log("還沒存在購物車!")
            this.addedProductsContainer.innerHTML +=
                `<div class="added-product" id="cart-product-${p_id}">
                            <span class="added-product-id">`+ p_id + `</span>
                            <span class="added-product-title">` + p_name + `</span>
                            <span class="added-product-price">` + p_price + `</span>
                            <span class="added-product-amount">` + p_amount + `</span>
                            <button class="remove-to-cart-button">移出購物車</button>
                        </div>`
        }
        console.log("跑一次updateCartUI：結束購物車html的id、名稱、價格、數量更新")
        /*
            5.2
            更新 this.cartAmount 跟 this.cartSubtotal 的 innerText
        */
        this.cartAmount.innerText = this.cart.amount;
        this.cartSubtotal.innerText = this.cart.subtotal;
        this.removeCarItem();
        console.log("跑一次updateCartUI：結束購物車html的總量、總價更新");
    },
    'fetchProducts': function () {
        console.log("跑一次fetchProducts")
        // 從資料庫請求商品資料
        let request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function () {
            if (request.readyState == 4 && request.status === 200) {
                // request 成功, 開始處理 response
                this.allProducts = JSON.parse(request.responseText);
            }
        }.bind(this));
        request.open("GET", this.urls.getProducts, false);
        request.send();

    },
    'submit': function () {
        console.log("跑一次submit")
        let request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function () {
            if (request.readyState == 4 && request.status === 200) {
                // request 成功, 開始處理 response
                console.log(request.responseText);
                eraseCookie(this.cookieName);//送出後清除cookie
            }
        }.bind(this));

        let data = {
            'items': this.cart.items,
            'subtotal': this.cart.subtotal,
            'token': 'addf3ddd60afd41fc3162b7ef1569c233dc85fe0a1854153b4c275092841c70c'
        };
        data = JSON.stringify(data);

        request.open("POST", this.urls.submit, true);
        request.setRequestHeader('Content-type', 'application/json');

        request.send(data);
    },
}