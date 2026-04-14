var nameProduct, maProduct, sanPhamHienTai; // Tên sản phẩm trong trang này, 
// là biến toàn cục để có thể dùng ở bát cứ đâu trong trang
// không cần tính toán lấy tên từ url nhiều lần

window.onload = function () {
    khoiTao();

    // thêm tags (từ khóa) vào khung tìm kiếm
    var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
    for (var t of tags) addTags(t, "index.html?search=" + t, true);

    phanTich_URL_chiTietSanPham();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), list_products);

    // Thêm gợi ý sản phẩm
    sanPhamHienTai && suggestion();
}

function khongTimThaySanPham() {
    document.getElementById('productNotFound').style.display = 'block';
    document.getElementsByClassName('chitietSanpham')[0].style.display = 'none';
}

function phanTich_URL_chiTietSanPham() {
    nameProduct = window.location.href.split('?')[1]; // lấy tên
    if(!nameProduct) return khongTimThaySanPham();

    // tách theo dấu '-' vào gắn lại bằng dấu ' ', code này giúp bỏ hết dấu '-' thay vào bằng khoảng trắng.
    // code này làm ngược lại so với lúc tạo href cho sản phẩm trong file classes.js
    nameProduct = nameProduct.split('-').join(' ');

    for(var p of list_products) {
        if(nameProduct == p.name) {
            maProduct = p.masp;
            break;
        }
    }

    sanPhamHienTai = timKiemTheoMa(list_products, maProduct);
    if(!sanPhamHienTai) return khongTimThaySanPham();

    var divChiTiet = document.getElementsByClassName('chitietSanpham')[0];

    // Đổi title
    document.title = nameProduct + ' - Thế giới điện thoại';

    // Cập nhật tên h1
    var h1 = divChiTiet.getElementsByTagName('h1')[0];
    h1.innerHTML += nameProduct;

    // Cập nhật sao
    var rating = "";
    if (sanPhamHienTai.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            if (i <= sanPhamHienTai.star) {
                rating += `<i class="fa fa-star"></i>`
            } else {
                rating += `<i class="fa fa-star-o"></i>`
            }
        }
        rating += `<span> ` + sanPhamHienTai.rateCount + ` đánh giá</span>`;
    }
    divChiTiet.getElementsByClassName('rating')[0].innerHTML += rating;

    // Cập nhật giá + label khuyến mãi
    var price = divChiTiet.getElementsByClassName('area_price')[0];
    if (sanPhamHienTai.promo.name != 'giareonline') {
        price.innerHTML = `<strong>` + sanPhamHienTai.price + `₫</strong>`;
        price.innerHTML += new Promo(sanPhamHienTai.promo.name, sanPhamHienTai.promo.value).toWeb();
    } else {
        document.getElementsByClassName('ship')[0].style.display = ''; // hiển thị 'giao hàng trong 1 giờ'
        price.innerHTML = `<strong>` + sanPhamHienTai.promo.value + `&#8363;</strong>
					        <span>` + sanPhamHienTai.price + `&#8363;</span>`;
    }

    // Cập nhật chi tiết khuyến mãi
    document.getElementById('detailPromo').innerHTML = getDetailPromo(sanPhamHienTai);

    // Cập nhật thông số
    var info = document.getElementsByClassName('info')[0];
    var s = addThongSo('Màn hình', sanPhamHienTai.detail.screen);
    s += addThongSo('Hệ điều hành', sanPhamHienTai.detail.os);
    s += addThongSo('Camara sau', sanPhamHienTai.detail.camara);
    s += addThongSo('Camara trước', sanPhamHienTai.detail.camaraFront);
    s += addThongSo('CPU', sanPhamHienTai.detail.cpu);
    s += addThongSo('RAM', sanPhamHienTai.detail.ram);
    s += addThongSo('Bộ nhớ trong', sanPhamHienTai.detail.rom);
    s += addThongSo('Thẻ nhớ', sanPhamHienTai.detail.microUSB);
    s += addThongSo('Dung lượng pin', sanPhamHienTai.detail.battery);
    info.innerHTML = s;

    // Cập nhật hình
    var hinh = divChiTiet.getElementsByClassName('picture')[0];
    hinh = hinh.getElementsByTagName('img')[0];
    hinh.src = sanPhamHienTai.img;
    document.getElementById('bigimg').src = sanPhamHienTai.img;

    // Hình nhỏ
    addSmallImg("img/products/huawei-mate-20-pro-green-600x600.jpg");
    addSmallImg("img/chitietsanpham/oppo-f9-mau-do-1-org.jpg");
    addSmallImg("img/chitietsanpham/oppo-f9-mau-do-2-org.jpg");
    addSmallImg("img/chitietsanpham/oppo-f9-mau-do-3-org.jpg");
    addSmallImg("img/products/huawei-mate-20-pro-green-600x600.jpg");
    addSmallImg("img/chitietsanpham/oppo-f9-mau-do-3-org.jpg");
    addSmallImg("img/products/huawei-mate-20-pro-green-600x600.jpg");

    // Khởi động thư viện hỗ trợ banner - chỉ chạy sau khi tạo xong hình nhỏ
    var owl = $('.owl-carousel');
    owl.owlCarousel({
        items: 5,
        center: true,
        smartSpeed: 450,
    });
    setupStarRating();
    renderComments();
}

// Chi tiết khuyến mãi
function getDetailPromo(sp) {
    switch (sp.promo.name) {
        case 'tragop':
            var span = `<span style="font-weight: bold"> lãi suất ` + sp.promo.value + `% </span>`;
            return `Khách hàng có thể mua trả góp sản phẩm với ` + span + `với thời hạn 6 tháng kể từ khi mua hàng.`;

        case 'giamgia':
            var span = `<span style="font-weight: bold">` + sp.promo.value + `</span>`;
            return `Khách hàng sẽ được giảm ` + span + `₫ khi tới mua trực tiếp tại cửa hàng`;

        case 'moiramat':
            return `Khách hàng sẽ được thử máy miễn phí tại cửa hàng. Có thể đổi trả lỗi trong vòng 2 tháng.`;

        case 'giareonline':
            var del = stringToNum(sp.price) - stringToNum(sp.promo.value);
            var span = `<span style="font-weight: bold">` + numToString(del) + `</span>`;
            return `Sản phẩm sẽ được giảm ` + span + `₫ khi mua hàng online bằng thẻ VPBank hoặc tin nhắn SMS`;

        default:
            var span = `<span style="font-weight: bold">61 xe Wave Alpha</span>`;
            return `Cơ hội trúng ` + span + ` khi trả góp Home Credit`;
    }
}

function addThongSo(ten, giatri) {
    return `<li>
                <p>` + ten + `</p>
                <div>` + giatri + `</div>
            </li>`;
}

// add hình
function addSmallImg(img) {
    var newDiv = `<div class='item'>
                        <a>
                            <img src=` + img + ` onclick="changepic(this.src)">
                        </a>
                    </div>`;
    var banner = document.getElementsByClassName('owl-carousel')[0];
    banner.innerHTML += newDiv;
}

// đóng mở xem hình
function opencertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(1)";
}

function closecertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(0)";
}

// đổi hình trong chế độ xem hình
function changepic(src) {
    document.getElementById("bigimg").src = src;
}

// Thêm sản phẩm vào các khung sản phẩm
function addKhungSanPham(list_sanpham, tenKhung, color, ele) {
	// convert color to code
	var gradient = `background-image: linear-gradient(120deg, ` + color[0] + ` 0%, ` + color[1] + ` 50%, ` + color[0] + ` 100%);`
	var borderColor = `border-color: ` + color[0];
	var borderA = `	border-left: 2px solid ` + color[0] + `;
					border-right: 2px solid ` + color[0] + `;`;

	// mở tag
	var s = `<div class="khungSanPham" style="` + borderColor + `">
				<h3 class="tenKhung" style="` + gradient + `">* ` + tenKhung + ` *</h3>
				<div class="listSpTrongKhung flexContain">`;

	for (var i = 0; i < list_sanpham.length; i++) {
		s += addProduct(list_sanpham[i], null, true);
		// truyền vào 'true' để trả về chuỗi rồi gán vào s
	}

	// thêm khung vào contain-khung
	ele.innerHTML += s;
}

/// gợi ý sản phẩm
function suggestion(){
    // ====== Lay ra thong tin san pham hien tai ====== 
    const giaSanPhamHienTai = stringToNum(sanPhamHienTai.price);

    // ====== Tìm các sản phẩm tương tự theo tiêu chí ====== 
    const sanPhamTuongTu = list_products
    // Lọc sản phẩm trùng
    .filter((_) => _.masp !== sanPhamHienTai.masp)
    // Tính điểm cho từng sản phẩm
    .map(sanPham => {
        // Tiêu chí 1: giá sản phẩm ko lệch nhau quá 1 triệu
        const giaSanPham = stringToNum(sanPham.price);
        let giaTienGanGiong = Math.abs(giaSanPham - giaSanPhamHienTai) < 1000000;

        // Tiêu chí 2: các thông số kỹ thuật giống nhau
        let soLuongChiTietGiongNhau = 0;
        for(let key in sanPham.detail) {
            let value = sanPham.detail[key];
            let currentValue = sanPhamHienTai.detail[key];

            if(value == currentValue) soLuongChiTietGiongNhau++;
        }
        let giongThongSoKyThuat  = soLuongChiTietGiongNhau >= 3;

        // Tiêu chí 3: cùng hãng sản xuất 
        let cungHangSanXuat = sanPham.company ===  sanPhamHienTai.company

        // Tiêu chí 4: cùng loại khuyến mãi
        let cungLoaiKhuyenMai = sanPham.promo?.name === sanPhamHienTai.promo?.name;
        
        // Tiêu chí 5: có đánh giá, số sao
        let soDanhGia = Number.parseInt(sanPham.rateCount, 10)
        let soSao = Number.parseInt(sanPham.star, 10);

        // Tính điểm cho sản phẩm này (càng thoả nhiều tiêu chí điểm càng cao => càng nên gợi ý)
        let diem = 0;
        if(giaTienGanGiong) diem += 20;
        if(giongThongSoKyThuat) diem += soLuongChiTietGiongNhau;
        if(cungHangSanXuat) diem += 15;
        if(cungLoaiKhuyenMai) diem += 10;
        if(soDanhGia > 0) diem += (soDanhGia + '').length;
        diem += soSao;

        // Thêm thuộc tính diem vào dữ liệu trả về
        return {
            ...sanPham,
            diem: diem
        };
    })
    // Sắp xếp theo số điểm cao xuống thấp
    .sort((a,b) => b.diem - a.diem)
    // Lấy ra 10 sản phẩm đầu tiên
    .slice(0, 10);

    console.log(sanPhamTuongTu)

    // ====== Hiển thị 5 sản phẩm lên web ====== 
    if(sanPhamTuongTu.length) {
        let div = document.getElementById('goiYSanPham');
        addKhungSanPham(sanPhamTuongTu, 'Bạn có thể thích', ['#434aa8', '#ec1f1f'], div);
    }
}

// ================= CÁC HÀM XỬ LÝ BÌNH LUẬN VÀ ĐÁNH GIÁ ================= 

var currentRating = 0; // Biến lưu số sao đang chọn

// 1. Cài đặt sự kiện khi click vào các ngôi sao
function setupStarRating() {
    var stars = document.querySelectorAll('#star-rating i');
    stars.forEach(function(star) {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-index'));
            // Reset tất cả về sao rỗng
            stars.forEach(s => {
                s.classList.remove('fa-star');
                s.classList.add('fa-star-o');
            });
            // Tô màu các sao được chọn
            for(var i = 0; i < currentRating; i++) {
                stars[i].classList.remove('fa-star-o');
                stars[i].classList.add('fa-star');
            }
        });
    });
}

// 2. Hàm gửi bình luận
function submitComment() {
    var user = getCurrentUser(); // Hàm lấy thông tin user đã đăng nhập (có sẵn ở dungchung.js)
    if (!user) {
        alert('Bạn cần đăng nhập để gửi bình luận!');
        return;
    }

    if (currentRating === 0) {
        alert('Vui lòng chọn số sao để đánh giá sản phẩm!');
        return;
    }

    var text = document.getElementById('comment-text').value.trim();
    if (text === '') {
        alert('Vui lòng nhập nội dung bình luận!');
        return;
    }

    // Lấy dữ liệu bình luận từ LocalStorage dựa trên Mã sản phẩm
    var storageKey = 'comments_' + maProduct;
    var comments = JSON.parse(window.localStorage.getItem(storageKey)) || [];
    
    // Tạo object bình luận mới
    var newComment = {
        user: user.hoTen || user.username,
        rating: currentRating,
        content: text,
        date: new Date().toLocaleString('vi-VN')
    };
    
    // Lưu vào LocalStorage
    comments.push(newComment);
    window.localStorage.setItem(storageKey, JSON.stringify(comments));

    // Reset lại form
    document.getElementById('comment-text').value = '';
    currentRating = 0;
    var stars = document.querySelectorAll('#star-rating i');
    stars.forEach(s => {
        s.classList.remove('fa-star');
        s.classList.add('fa-star-o');
    });

    alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    renderComments(); // Cập nhật lại UI
}

// 3. Hàm hiển thị bình luận ra màn hình
function renderComments() {
    var commentList = document.getElementById('comment-list');
    var storageKey = 'comments_' + maProduct;
    var comments = JSON.parse(window.localStorage.getItem(storageKey)) || [];
    
    if (comments.length === 0) {
        commentList.innerHTML = '<p style="color:#777; font-style:italic;">Chưa có bình luận nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>';
        return;
    }

    var html = '';
    // Lặp ngược mảng để bình luận mới nhất hiển thị lên đầu
    for (var i = comments.length - 1; i >= 0; i--) {
        var c = comments[i];
        var starHtml = '';
        for(var j = 1; j <= 5; j++) {
            if (j <= c.rating) starHtml += '<i class="fa fa-star"></i>';
            else starHtml += '<i class="fa fa-star-o"></i>';
        }

        html += `
            <div class="comment-item">
                <span class="user-name"><i class="fa fa-user-circle"></i> ` + c.user + `</span>
                <span class="user-stars">` + starHtml + `</span>
                <span class="comment-date">` + c.date + `</span>
                <div class="comment-content">` + c.content + `</div>
            </div>
        `;
    }
    commentList.innerHTML = html;
}