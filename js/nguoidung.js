var currentUser;
var tongTienTatCaDonHang = 0; 
var tongSanPhamTatCaDonHang = 0;

window.onload = function () {
    khoiTao();
    autocomplete(document.getElementById('search-box'), list_products);
    var tags = ["Samsung", "iPhone", "Huawei", "Oppo", "Mobi"];
    for (var t of tags) addTags(t, "index.html?search=" + t);

    currentUser = getCurrentUser();

    if (currentUser) {
        var listUser = getListUser();
        for (var u of listUser) {
            if (equalUser(currentUser, u)) {
                currentUser = u;
                setCurrentUser(u);
            }
        }
        addTatCaDonHang(currentUser); 
        addInfoUser(currentUser);
    } else {
        var warning = `<h2 style="color: red; font-weight:bold; text-align:center; font-size: 2em; padding: 50px;">
                            Bạn chưa đăng nhập !!
                        </h2>`;
        document.getElementsByClassName('infoUser')[0].innerHTML = warning;
    }
}

// === PHẦN THÔNG TIN NGƯỜI DÙNG (GIỮ NGUYÊN LOGIC CŨ) ===
function addInfoUser(user) {
    if (!user) return;
    document.getElementsByClassName('infoUser')[0].innerHTML = `
    <hr>
    <table>
        <tr><th colspan="3">THÔNG TIN KHÁCH HÀNG</th></tr>
        <tr>
            <td>Tài khoản: </td>
            <td> <input type="text" value="${user.username}" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'username')"></i> </td>
        </tr>
        <tr>
            <td>Mật khẩu: </td>
            <td style="text-align: center;"> <i class="fa fa-pencil" id="butDoiMatKhau" onclick="openChangePass()"> Đổi mật khẩu</i> </td>
            <td></td>
        </tr>
        <tr>
            <td colspan="3" id="khungDoiMatKhau">
                <table>
                    <tr><td>Mật khẩu cũ:</td><td><input type="password"></td></tr>
                    <tr><td>Mật khẩu mới:</td><td><input type="password"></td></tr>
                    <tr><td>Xác nhận:</td><td><input type="password"></td></tr>
                    <tr><td></td><td><button onclick="changePass()">Đồng ý</button></td></tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>Họ: </td>
            <td> <input type="text" value="${user.ho}" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'ho')"></i> </td>
        </tr>
        <tr>
            <td>Tên: </td>
            <td> <input type="text" value="${user.ten}" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'ten')"></i> </td>
        </tr>
        <tr>
            <td>Email: </td>
            <td> <input type="text" value="${user.email}" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'email')"></i> </td>
        </tr>
        <tr><td colspan="3" style="padding:5px; border-top: 2px solid #ccc;"></td></tr>
        <tr>
            <td>Tổng tiền đã mua: </td>
            <td> <input type="text" value="${numToString(tongTienTatCaDonHang)}₫" readonly> </td>
            <td></td>
        </tr>
        <tr>
            <td>Số lượng sản phẩm: </td>
            <td> <input type="text" value="${tongSanPhamTatCaDonHang}" readonly> </td>
            <td></td>
        </tr>
    </table>`;
}

// === PHẦN THÔNG TIN ĐƠN HÀNG ===
function addTatCaDonHang(user) {
    var listDiv = document.getElementsByClassName('listDonHang')[0];
    if (!user.donhang || !user.donhang.length) {
        listDiv.innerHTML = `<h3 style="padding: 50px; color: green; text-align: center">Xin chào ${user.username}. Bạn chưa có đơn hàng nào.</h3>`;
        return;
    }
    
    listDiv.innerHTML = ""; // Clear trước khi vẽ
    
    // SỬA TẠI ĐÂY: Chạy vòng lặp ngược từ cuối mảng về 0
    // Điều này giúp đơn hàng mới nhất (nằm ở cuối) được render ra HTML đầu tiên
    // đồng thời vẫn giữ nguyên được giá trị 'i' (index gốc) cho hàm xuatHoaDon(index)
    for (var i = user.donhang.length - 1; i >= 0; i--) {
        addDonHang(user.donhang[i], i);
    }
}

function addDonHang(dh, index) {
    
    var div = document.getElementsByClassName('listDonHang')[0];
    var s = `
            <table class="listSanPham">
                <tr> 
                    <th colspan="6">
                        <h3 style="text-align:center;"> Đơn hàng ngày: ${new Date(dh.ngaymua).toLocaleString()}</h3> 
                    </th>
                </tr>
                <tr>
                    <th>STT</th><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Thành tiền</th><th>Thời gian thêm</th> 
                </tr>`;

    var totalPrice = 0;
    for (var i = 0; i < dh.sp.length; i++) {
        var p = timKiemTheoMa(list_products, dh.sp[i].ma);
        var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
        var thanhtien = stringToNum(price) * dh.sp[i].soluong;
        s += `
                <tr>
                    <td>${i + 1}</td>
                    <td class="noPadding imgHide">
                        <a target="_blank" href="chitietsanpham.html?${p.name.split(' ').join('-')}">
                            ${p.name} <img src="${p.img}">
                        </a>
                    </td>
                    <td class="alignRight">${price} ₫</td>
                    <td class="soluong">${dh.sp[i].soluong}</td>
                    <td class="alignRight">${numToString(thanhtien)} ₫</td>
                    <td style="text-align: center">${new Date(dh.sp[i].date).toLocaleString()}</td>
                </tr>`;
        totalPrice += thanhtien;
        tongSanPhamTatCaDonHang += dh.sp[i].soluong;
    }
    tongTienTatCaDonHang += totalPrice;

    s += `
                <tr style="font-weight:bold; text-align:center; height: 4em;">
                    <td colspan="3">TỔNG TIỀN: </td>
                    <td class="alignRight" style="color:red">${numToString(totalPrice)} ₫</td>
                    <td>${dh.tinhTrang}</td>
                    <td class='thanhtoan' onclick="xuatHoaDon(${index})"><i class="fa fa-print"></i> In hóa đơn</td>
                </tr>
            </table>
            <hr>`;
    div.innerHTML += s;
}

// === TÍNH NĂNG XUẤT HÓA ĐƠN ===
function xuatHoaDon(index) {
    var dh = currentUser.donhang[index];
    if (!dh) return;

    var productRows = "";
    var total = 0;

    dh.sp.forEach((item, i) => {
        var p = timKiemTheoMa(list_products, item.ma);
        var priceStr = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
        var subtotal = stringToNum(priceStr) * item.soluong;
        total += subtotal;

        productRows += `
            <tr>
                <td style="border:1px solid #ccc; padding:8px; text-align:center;">${i+1}</td>
                <td style="border:1px solid #ccc; padding:8px;">${p.name}</td>
                <td style="border:1px solid #ccc; padding:8px; text-align:right;">${priceStr} ₫</td>
                <td style="border:1px solid #ccc; padding:8px; text-align:center;">${item.soluong}</td>
                <td style="border:1px solid #ccc; padding:8px; text-align:right;">${numToString(subtotal)} ₫</td>
            </tr>`;
    });

    var invoiceHTML = `
        <div style="width:700px; margin:auto; font-family:Arial; border:1px solid #000; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div><h1 style="color:#17c671; margin:0;">TechMobile Store</h1><p>Hệ thống bán lẻ điện thoại toàn quốc</p></div>
                <div style="text-align:right;"><p>Số hóa đơn: #HD${new Date(dh.ngaymua).getTime()}</p><p>Ngày: ${new Date().toLocaleDateString()}</p></div>
            </div>
            <hr>
            <h2 style="text-align:center;">HÓA ĐƠN BÁN HÀNG</h2>
            <p><strong>Khách hàng:</strong> ${currentUser.ho} ${currentUser.ten} (${currentUser.username})</p>
            <p><strong>Địa chỉ:</strong> ${dh.diachi || 'Chưa cập nhật'}</p>
            <p><strong>Số điện thoại:</strong> ${dh.sdt || 'Chưa cập nhật'}</p>
            <p><strong>Thanh toán:</strong> ${dh.phuongthuc || 'Tiền mặt'}</p>
            
            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <tr style="background:#f2f2f2;">
                    <th style="border:1px solid #ccc; padding:8px;">STT</th>
                    <th style="border:1px solid #ccc; padding:8px;">Sản phẩm</th>
                    <th style="border:1px solid #ccc; padding:8px;">Đơn giá</th>
                    <th style="border:1px solid #ccc; padding:8px;">SL</th>
                    <th style="border:1px solid #ccc; padding:8px;">Thành tiền</th>
                </tr>
                ${productRows}
                <tr style="font-weight:bold; font-size:1.2em;">
                    <td colspan="4" style="border:1px solid #ccc; padding:8px; text-align:right;">TỔNG CỘNG:</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:right; color:red;">${numToString(total)} ₫</td>
                </tr>
            </table>

            <div style="margin-top:40px; display:flex; justify-content:space-around;">
                <div style="text-align:center;"><p><strong>Người mua hàng</strong></p><br><br><br><p>(Ký tên)</p></div>
                <div style="text-align:center;"><p><strong>Người bán hàng</strong></p><br><br><br><p>(Ký tên)</p></div>
            </div>
        </div>`;

    var win = window.open('', '_blank');
    win.document.write(`<html><head><title>Hóa đơn - TechMobile Store</title></head><body>${invoiceHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
}

// Các hàm phụ trợ (Đổi MK, Đổi thông tin) giữ nguyên như code cũ bạn cung cấp...
function openChangePass() { /* ... code cũ ... */ }
function changePass() { /* ... code cũ ... */ }
function changeInfo(iTag, info) { /* ... code cũ ... */ }
function openChangePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var actived = khungChangePass.classList.contains('active');
    if (actived) khungChangePass.classList.remove('active');
    else khungChangePass.classList.add('active');
}

function changePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var inps = khungChangePass.getElementsByTagName('input');
    if (inps[0].value != currentUser.pass) {
        alert('Sai mật khẩu !!');
        inps[0].focus();
        return;
    }
    if (inps[1] == '') {
        inps[1].focus();
        alert('Chưa nhập mật khẩu mới !');
    }
    if (inps[1].value != inps[2].value) {
        alert('Mật khẩu không khớp');
        inps[2].focus();
        return;
    }

    var temp = copyObject(currentUser);
    currentUser.pass = inps[1].value;

    // cập nhật danh sách sản phẩm trong localstorage
    setCurrentUser(currentUser);
    updateListUser(temp, currentUser);

    // Cập nhật trên header
    capNhat_ThongTin_CurrentUser();

    // thông báo
    addAlertBox('Thay đổi mật khẩu thành công.', '#5f5', '#000', 4000);
    openChangePass();
}

function changeInfo(iTag, info) {
    var inp = iTag.parentElement.previousElementSibling.getElementsByTagName('input')[0];

    // Đang hiện
    if (!inp.readOnly && inp.value != '') {

        if (info == 'username') {
            var users = getListUser();
            for (var u of users) {
                if (u.username == inp.value && u.username != currentUser.username) {
                    alert('Tên đã có người sử dụng !!');
                    inp.value = currentUser.username;
                    return;
                }
            }
            // Đổi tên trong list đơn hàng
            if (!currentUser.donhang.length) {
                document.getElementsByClassName('listDonHang')[0].innerHTML = `
                    <h3 style="width=100%; padding: 50px; color: green; font-size: 2em; text-align: center"> 
                        Xin chào ` + inp.value + `. Bạn chưa có đơn hàng nào.
                    </h3>`;
            }


        } else if (info == 'email') {
            var users = getListUser();
            for (var u of users) {
                if (u.email == inp.value && u.username != currentUser.username) {
                    alert('Email đã có người sử dụng !!');
                    inp.value = currentUser.email;
                    return;
                }
            }
        }

        var temp = copyObject(currentUser);
        currentUser[info] = inp.value;

        // cập nhật danh sách sản phẩm trong localstorage
        setCurrentUser(currentUser);
        updateListUser(temp, currentUser);

        // Cập nhật trên header
        capNhat_ThongTin_CurrentUser();

        iTag.innerHTML = '';

    } else {
        iTag.innerHTML = 'Đồng ý';
        inp.focus();
        var v = inp.value;
        inp.value = '';
        inp.value = v;
    }

    inp.readOnly = !inp.readOnly;
}


