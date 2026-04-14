var currentuser; 
window.onload = function () {
    khoiTao();
	autocomplete(document.getElementById('search-box'), list_products);
	var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
	for (var t of tags) addTags(t, "index.html?search=" + t);

	currentuser = getCurrentUser();
	addProductToTable(currentuser);
}

function addProductToTable(user) {
	var table = document.getElementsByClassName('listSanPham')[0];
	var s = `
		<tbody>
			<tr>
                <th><input type="checkbox" id="checkAll" onclick="checkAll(this)"></th>
				<th>STT</th>
				<th>Sản phẩm</th>
				<th>Giá</th>
				<th>Số lượng</th>
				<th>Thành tiền</th>
				<th>Thời gian</th>
				<th>Xóa</th>
			</tr>`;

	if (!user) {
		s += `<tr><td colspan="8"><h1 style="color:red; text-align:center;">Bạn chưa đăng nhập !!</h1></td></tr>`;
		table.innerHTML = s; return;
	} else if (user.products.length == 0) {
		s += `<tr><td colspan="8"><h1 style="color:green; text-align:center;">Giỏ hàng trống !!</h1></td></tr>`;
		table.innerHTML = s; return;
	}

	for (var i = 0; i < user.products.length; i++) {
		var masp = user.products[i].ma;
		var soluongSp = user.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thoigian = new Date(user.products[i].date).toLocaleString();
		var thanhtien = stringToNum(price) * soluongSp;

		s += `
			<tr>
                <td><input type="checkbox" class="cart-checkbox" data-index="${i}" onchange="updateTotalPrice()"></td>
				<td>` + (i + 1) + `</td>
				<td class="noPadding imgHide">
					<a target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `">
						` + p.name + `
						<img src="` + p.img + `">
					</a>
				</td>
				<td class="alignRight">` + price + ` ₫</td>
				<td class="soluong" >
					<button onclick="giamSoLuong('` + masp + `')"><i class="fa fa-minus"></i></button>
					<input size="1" onchange="capNhatSoLuongFromInput(this, '` + masp + `')" value=` + soluongSp + `>
					<button onclick="tangSoLuong('` + masp + `')"><i class="fa fa-plus"></i></button>
				</td>
				<td class="alignRight">` + numToString(thanhtien) + ` ₫</td>
				<td style="text-align: center" >` + thoigian + `</td>
				<td class="noPadding"> <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(` + i + `)"></i> </td>
			</tr>`;
	}

	s += `
			<tr style="font-weight:bold; text-align:center">
				<td colspan="5">TỔNG TIỀN (Sản phẩm đã chọn): </td>
				<td class="alignRight" id="totalPriceCell" style="color:red; font-size:18px;"> 0 ₫ </td>
				<td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
				<td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
			</tr>
		</tbody>`;

	table.innerHTML = s;
    updateTotalPrice(); // Tính tổng tiền ngay khi tải bảng
}

// Hàm tính tổng tiền dựa trên các checkbox được tích
function updateTotalPrice() {
    var checkboxes = document.getElementsByClassName('cart-checkbox');
    var total = 0;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            var index = parseInt(checkboxes[i].getAttribute('data-index'));
            var p_cart = currentuser.products[index];
            var p_info = timKiemTheoMa(list_products, p_cart.ma);
            var price = (p_info.promo.name == 'giareonline' ? p_info.promo.value : p_info.price);
            total += stringToNum(price) * p_cart.soluong;
        }
    }
    document.getElementById('totalPriceCell').innerHTML = numToString(total) + ' ₫';
}

function checkAll(source) {
    var checkboxes = document.getElementsByClassName('cart-checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = source.checked;
    }
    updateTotalPrice();
}

function thanhToan() {
    if (!currentuser.products.length) {
        addAlertBox('Giỏ hàng trống!', '#ffb400', '#fff', 2000); return;
    }
    
    var checkboxes = document.getElementsByClassName('cart-checkbox');
    var anyChecked = false;
    var totalToPay = 0; // Biến tính tổng tiền

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) { 
            anyChecked = true; 
            var index = parseInt(checkboxes[i].getAttribute('data-index'));
            var p_cart = currentuser.products[index];
            var p_info = timKiemTheoMa(list_products, p_cart.ma);
            var price = (p_info.promo.name == 'giareonline' ? p_info.promo.value : p_info.price);
            totalToPay += stringToNum(price) * p_cart.soluong;
        }
    }

    if (!anyChecked) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!"); return;
    }

    document.getElementById('checkoutForm').style.display = 'block';
    document.getElementById('checkoutForm').scrollIntoView({ behavior: 'smooth' });

    // Hiển thị tên
    document.getElementById('tenkh').value = currentuser.hoTen || currentuser.username || "";

    // Ghi số tiền ra giao diện text
    document.getElementById('qr-amount').innerText = numToString(totalToPay) + " ₫";
    
    // Tạo nội dung chuyển khoản (Viết liền không dấu để chuẩn form ngân hàng)
    var noiDungCK = "THANHTOAN " + (currentuser.username).toUpperCase();
    document.getElementById('nd-chuyenkhoan').innerText = noiDungCK;

    // ====== TẠO MÃ QR ĐỘNG TỰ ĐIỀN TIỀN & NỘI DUNG ======
    // API Cấu trúc: https://img.vietqr.io/image/<Mã_Ngân_hàng>-<STK>-<Template>.png?amount=<Số_Tiền>&addInfo=<Nội_dung>&accountName=<Tên_Chủ_TK>
    
    var bankID = "vietcombank";
    var accountNo = "9962877252";
    var accountName = "LA MINH QUAN"; // Đổi lại tên thật không dấu của bạn nếu muốn
    
    // Dùng encodeURIComponent để mã hóa khoảng trắng và kí tự đặc biệt trong URL
    var qrApiUrl = `https://img.vietqr.io/image/${bankID}-${accountNo}-compact2.png?amount=${totalToPay}&addInfo=${encodeURIComponent(noiDungCK)}&accountName=${encodeURIComponent(accountName)}`;
    
    // Gắn link ảnh QR vừa tạo vào thẻ img
    document.getElementById('img-qrcode').src = qrApiUrl;

    hienThiChiTietThanhToan(); 
}
// Hàm hiển thị các UI phụ thuộc vào phương thức thanh toán
function hienThiChiTietThanhToan() {
    var phuongThuc = document.getElementById('phuongthuc').value;
    
    // Ẩn tất cả các form thanh toán chi tiết
    var details = document.getElementsByClassName('payment-details');
    for(var i = 0; i < details.length; i++) {
        details[i].classList.remove('active');
    }
    
    // Kiểm tra giá trị được chọn và hiển thị form tương ứng
    if(phuongThuc === 'card') {
        document.getElementById('payment-card').classList.add('active');
    } else if(phuongThuc === 'qrcode') {
        document.getElementById('payment-qrcode').classList.add('active');
    }
}

function xacNhanThanhToan() {
    var tenKhachHang = document.getElementById('tenkh').value;
    var diachi = document.getElementById('diachi').value;
    var sdt = document.getElementById('sdt').value;
    var dropdownThanhToan = document.getElementById('phuongthuc');
    var kieuThanhToanText = dropdownThanhToan.options[dropdownThanhToan.selectedIndex].text;

    if (!tenKhachHang || !diachi || !sdt) { 
        alert("Vui lòng nhập đầy đủ thông tin!"); return; 
    }

    if (window.confirm('Xác nhận đặt hàng?')) {
        var checkboxes = document.getElementsByClassName('cart-checkbox');
        var spThanhToan = [];
        var spGiuLai = [];
        var tongTienDonHang = 0; // Biến để chốt tổng tiền

        for (var i = 0; i < currentuser.products.length; i++) {
            var isChecked = false;
            for (var j = 0; j < checkboxes.length; j++) {
                if (parseInt(checkboxes[j].getAttribute('data-index')) === i && checkboxes[j].checked) {
                    isChecked = true; break;
                }
            }
            if (isChecked) {
                var p = currentuser.products[i];
                var p_info = timKiemTheoMa(list_products, p.ma);
                var giaBan = (p_info.promo.name == 'giareonline' ? p_info.promo.value : p_info.price);
                
                // Cộng dồn vào tổng tiền đơn hàng
                tongTienDonHang += stringToNum(giaBan) * p.soluong;
                
                spThanhToan.push(p);
            } else {
                spGiuLai.push(currentuser.products[i]);
            }
        }

        // Lưu đơn hàng với số tiền CỐ ĐỊNH
        currentuser.donhang.push({
            "sp": spThanhToan,
            "ngaymua": new Date(),
            "tinhTrang": 'Đang chờ xử lý',
            "tenKhachHang": tenKhachHang,
            "diachi": diachi,
            "sdt": sdt,
            "phuongThuc": kieuThanhToanText,
            "tongTien": tongTienDonHang // Chốt số tiền tại đây
        });

        currentuser.products = spGiuLai;
        capNhatMoiThu();
        document.getElementById('checkoutForm').style.display = 'none';
        addAlertBox('Đặt hàng thành công!', '#17c671', '#fff', 4000);
    }
}

// Các hàm cập nhật số lượng và LocalStorage giữ nguyên như cũ
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;
	for (var p of currentuser.products) { if (p.ma == masp) p.soluong = soLuongMoi; }
	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) { if (p.ma == masp) p.soluong++; }
	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp && p.soluong > 1) p.soluong--;
	}
	capNhatMoiThu();
}

function capNhatMoiThu() {
	setCurrentUser(currentuser);
	updateListUser(currentuser);
	addProductToTable(currentuser);
	capNhat_ThongTin_CurrentUser();
}