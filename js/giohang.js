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
    
    // Kiểm tra xem có tích chọn sản phẩm nào không
    var checkboxes = document.getElementsByClassName('cart-checkbox');
    var anyChecked = false;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) { anyChecked = true; break; }
    }

    if (!anyChecked) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!"); return;
    }

    document.getElementById('checkoutForm').style.display = 'block';
    document.getElementById('checkoutForm').scrollIntoView({ behavior: 'smooth' });
}

function xacNhanThanhToan() {
    var diachi = document.getElementById('diachi').value;
    var sdt = document.getElementById('sdt').value;
    if (!diachi || !sdt) { alert("Vui lòng nhập đầy đủ thông tin giao hàng!"); return; }

    if (window.confirm('Xác nhận đặt các sản phẩm đã chọn?')) {
        var checkboxes = document.getElementsByClassName('cart-checkbox');
        var spThanhToan = [];
        var spGiuLai = [];

        for (var i = 0; i < currentuser.products.length; i++) {
            var isChecked = false;
            for (var j = 0; j < checkboxes.length; j++) {
                if (parseInt(checkboxes[j].getAttribute('data-index')) === i && checkboxes[j].checked) {
                    isChecked = true; break;
                }
            }
            if (isChecked) spThanhToan.push(currentuser.products[i]);
            else spGiuLai.push(currentuser.products[i]);
        }

        currentuser.donhang.push({
            "sp": spThanhToan,
            "ngaymua": new Date(),
            "tinhTrang": 'Đang chờ xử lý',
            "diachi": diachi,
            "sdt": sdt
        });

        currentuser.products = spGiuLai; // Chỉ giữ lại sản phẩm chưa thanh toán
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