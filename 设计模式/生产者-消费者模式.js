/*  
由于node使用单线程的方式实现，所以，在此使用定时器timer代替线程thread来实现生产者消费者模型。
*/
var productArray = [];
var productArrayLen = 0;
var productLock = false;
var PRODUCT_ARRAY_THRESHOLD = 10;

var producerTimer = setInterval(function () {
			if (!productLock) {
				productLock = true;

				if (productArrayLen < PRODUCT_ARRAY_THRESHOLD) {
					productArray.push('product');
					productArrayLen++;
					console.log('product:' + productArrayLen + '   producer.push');
				} else {
					console.log('product:' + productArrayLen + '   producer.idle');
				}
				productLock = false;
			}
	}, 500);

var consumerTimer = setInterval(function () {
			if (!productLock) {
				productLock = true;

				if (productArrayLen) {
					var product = productArray.shift();
					productArrayLen--;
					console.log('product:' + productArrayLen + '   consumer.pop');
				} else {
					console.log('product:' + productArrayLen + '   consumer.idle');
				}

				productLock = false;
			}
    }, 1000);
    
    setTimeout(() => {
        clearInterval(producerTimer);
        clearInterval(consumerTimer)
    }, 10000);


