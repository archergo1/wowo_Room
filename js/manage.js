const orderBoard = document.querySelector(".orderPage-table tbody");
const clearAllBtn = document.querySelector(".discardAllBtn");
const loading = document.querySelector(".loading");

// data
const url =
  "https://livejs-api.hexschool.io/api/livejs/v1/admin/shun11023/orders/";
const config = { headers: { authorization: "su60t3pBasNH0EkuPPzpZIZ1jUG2" } };
let data;

function init() {
  axios
    .get(url, config)
    .then((res) => {
      data = res.data.orders;
      render();
    })
    .catch((err) => {
      console.log(err);
    });
}

function render() {
  let allContent = "";

  // check data
  if (data.length < 1) {
    document.querySelector(
      "#chart"
    ).innerHTML = `<p class="text-center">暫無資料</p>`;
    orderBoard.innerHTML = ``;

    loading.classList.add("none");
    return;
  }

  // deal wth order display
  data.forEach((item) => {
    let createdDate = dateTranslate(item.updatedAt);
    let status = item.paid === true ? "已處理" : "未處理";

    allContent += `
    <tr data-id=${item.id}>
      <td>${item.createdAt}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>`;

    // deal with variety of products
    item.products.forEach((product) => {
      allContent += `<p>${product.title}</p>`;
    });

    allContent += `</td>
      <td>${createdDate}</td>
      <td class="orderStatus">
        <a href="#" class="orderStatus" data-paid=${item.paid}>${status}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" value="刪除" />
      </td>
  </tr>`;
  });

  orderBoard.innerHTML = allContent;

  // chart data
  let columns = [];
  const items = {};
  data.forEach((order) => {
    order.products.forEach((item) => {
      if (items[item.title]) {
        items[item.title] += 1;
      } else {
        items[item.title] = 1;
      }
    });
  });
  for (key in items) {
    columns.push([key, items[key]]);
  }
  createChart(columns);
  loading.classList.add("none");
}

function dateTranslate(time) {
  const date = new Date(time * 1000);
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  if (mm < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return `${yyyy}/${mm}/${dd}`;
}

function clearAll(e) {
  e.preventDefault();
  loading.classList.remove("none");
  axios
    .delete(url, config)
    .then((res) => {
      data = res.data.orders;
      render();
    })
    .catch((err) => {
      loading.classList.add("none");
      alert(err.response.data.message);
    });
}

function clearItem(e) {
  if (!e.target.classList.contains("delSingleOrder-Btn")) return;
  const ItemId = e.target.parentNode.parentNode.getAttribute("data-id");

  loading.classList.remove("none");
  axios
    .delete(url + ItemId, config)
    .then((res) => {
      data = res.data.orders;
      render();
    })
    .catch((err) => {
      loading.classList.add("none");
      console.log(err);
    });
}

function toggleStatus(e) {
  if (!e.target.classList.contains("orderStatus")) return;
  e.preventDefault();
  obj = { data: {} };
  obj.data.id = e.target.parentNode.parentNode.getAttribute("data-id");
  obj.data.paid = e.target.getAttribute("data-paid") === "true" ? false : true;

  loading.classList.remove("none");
  axios
    .put(url, obj, config)
    .then((res) => {
      data = res.data.orders;
      render();
    })
    .catch((err) => {
      loading.classList.add("none");
      console.log(err);
    });
}

function createChart(data) {
  let chart = c3.generate({
    bindto: "#chart",
    data: {
      type: "donut",
      columns: data,
    },
  });
}

init();

clearAllBtn.addEventListener("click", clearAll);

orderBoard.addEventListener("click", clearItem);

orderBoard.addEventListener("click", toggleStatus);
