// async function submitNewCupcake(evt) {
//   evt.preventDefault()
//   let flavor = $("#input-flavor").val();
//   let size = $("#input-size").val();
//   let rating = $("#input-rating").val();
//   let image = $("#input-image").val();
//   let cupcakeJSON = JSON.stringify({ flavor, size, rating, image });
//   fetchObj = {
//     method: "post",
//     headers: { "Content-Type": "application/json" },
//     body: cupcakeJSON,
//   }
//   // let response = await fetch("/api/cupcakes", fetchObj);
//   // return response.json();
//   await fetch("/api/cupcakes", fetchObj);
//   displayAllCupcakes();
// }

// async function displayAllCupcakes() {
//   $("ul").empty();
//   let response = await fetch("/api/cupcakes");
//   let cupcakes = (await response.json()).cupcakes;
//   cupcakes.forEach(cake => {
//     $("ul").append($(`<li>${cake.flavor}</li>`));
//   });
// }

class Cupcake {
  constructor(inputObj) {
    for (let attrib in inputObj) {
      this[attrib] = inputObj[attrib];
    }
  }

  generateJQuery() {
    let $cakeCard = $("<div>").addClass("column padded-1");
    $cakeCard.append($(`<img src=${this.image}>`).addClass("profile-picture"));
    $cakeCard.append($("<div>").text(`Flavor: ${this.flavor}`));
    $cakeCard.append($("<div>").text(`Size: ${this.size}`));
    $cakeCard.append($("<div>").text(`Rating: ${this.rating}`));
    $cakeCard.attr("data-id", this.id);
    return $cakeCard;
  }

  generateDeleter() {
    let $deleter = $("<div>").text("X");
    $deleter.on("click", this.delete.bind(this));
    return $deleter;
  }

  async delete() {
    let fetchObj = { method: "delete" };
    let response = await fetch(`/api/cupcakes/${this.id}`, fetchObj);
    if (response.status == 200) {
      $(`div[data-id=${this.id}]`).remove();
    }
  }
}

class CupcakeList {
  constructor() {
    this.getAllCupcakes();
  }

  async getAllCupcakes() {
    let response = await fetch("/api/cupcakes");
    let cupcakes = (await response.json()).cupcakes;
    this.cupcakes = cupcakes.map((cake) => {
      return new Cupcake(cake);
    });
    this.displayAllCupcakes();
  }

  addCupcake(cupcake) {
    let $cakeCard = cupcake.generateJQuery();
    let $deleter = cupcake.generateDeleter();
    $deleter.on("click", () => {
      this.deleteCupcake($deleter.parent().attr("data-id"));
    })
    $("#cupcake-row").append($cakeCard.append($deleter));
  }

  displayAllCupcakes() {
    $("#cupcake-row").empty();
    for (let cupcake of this.cupcakes) {
      this.addCupcake(cupcake);
    }
  }

  async submitNewCupcake() {
    let inputs = Array.from($("input"));
    let inputNamesValues = inputs.reduce((inputObj, currInput) => {
      inputObj[currInput.name] = Boolean(currInput.value)
        ? currInput.value
        : null;
      return inputObj;
    }, {});
    let fetchObj = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputNamesValues),
    };
    let response = await fetch("/api/cupcakes", fetchObj);
    let newCake = new Cupcake((await response.json()).cupcake);
    this.cupcakes.push(newCake);
    this.addCupcake(newCake);
  }

  deleteCupcake(id) {
    this.cupcakes = this.cupcakes.filter((cake) => {
      return cake.id != id;
    });
  }
}

const cakesList = new CupcakeList();
$("#submit").click((evt) => {
  evt.preventDefault();
  cakesList.submitNewCupcake();
});
