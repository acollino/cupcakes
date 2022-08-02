class Cupcake {
  constructor(inputObj) {
    ({
      flavor: this.flavor,
      size: this.size,
      rating: this.rating,
      image: this.image,
      id: this.id,
    } = inputObj);
  }

  generateJQuery() {
    let $cakeCard = $("<div>").addClass("column-small card border border-rounded");
    let $imgHolder = $("<div>").addClass("picture-container");
    $imgHolder.append($(`<img src=${this.image}>`).addClass("profile-picture"));
    $cakeCard.append($imgHolder);
    $cakeCard.append($("<div>").text(`Flavor: ${this.flavor}`).addClass("cupcake-details"));
    $cakeCard.append($("<hr>"));
    $cakeCard.append($("<div>").text(`Size: ${this.size}`).addClass("cupcake-details"));
    $cakeCard.append($("<hr>"));
    $cakeCard.append($("<div>").text(`Rating: ${this.rating}`).addClass("cupcake-details"));
    $cakeCard.attr("data-id", this.id);
    return $cakeCard;
  }

  generateDeleter() {
    let $deleter = $("<div>").addClass("delete button button-red");
    $deleter.append($("<img>").attr("src", "/static/assets/delete.svg").addClass("icon"));
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

  async edit() {
    let fetchObj = convertInputIntoFetchObj(".input-edit", "patch");
    let response = await fetch(`/api/cupcakes/${this.id}`, fetchObj);
    if (response.status == 200) {
      let updatedCake = await response.json();
      Object.assign(this, updatedCake.cupcake);
      this.updateDOM();
    }
  }

  updateDOM() {
    let $cakeCard = $(`div[data-id=${this.id}]`);
    $cakeCard.find(".profile-picture").attr("src", this.image);
    $cakeCard.children(":contains('Flavor: ')").text(`Flavor: ${this.flavor}`);
    $cakeCard.children(":contains('Size: ')").text(`Size: ${this.size}`);
    $cakeCard.children(":contains('Rating: ')").text(`Rating: ${this.rating}`);
    $cakeCard.find(".edit-container").css("display", "none");
  }

  addEditFormEventHandler() {
    let $cakeCard = $(`div[data-id=${this.id}]`);
    $cakeCard.find(".edit-submit").on("click", (evt) => {
      evt.preventDefault();
      this.edit();
    });
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
    let $editButton = $("<div>").addClass("edit button button-light-blue");
    $editButton.append($("<img>").attr("src", "/static/assets/edit.svg").addClass("icon"));
    $deleter.on("click", () => {
      this.deleteCupcake($deleter.parents(".card").attr("data-id"));
    });
    $(".edit-container").first().clone().appendTo($cakeCard.children(".picture-container"));
    $cakeCard.children(".picture-container").append($deleter);
    $cakeCard.children(".picture-container").append($editButton);
    $editButton.on("click", () => {
      $(".edit-container").filter(function (index) {
        return $(this).parents(".card").attr("data-id") != $cakeCard.attr("data-id");
      }).css("display", "none");
      $editButton.parents(".card").find(".edit-container").toggle();
    });
    $("#cupcake-row").append($cakeCard);
    cupcake.addEditFormEventHandler();
  }

  displayAllCupcakes() {
    $("#cupcake-row").empty();
    for (let cupcake of this.cupcakes) {
      this.addCupcake(cupcake);
    }
  }

  async submitNewCupcake() {
    let fetchObj = convertInputIntoFetchObj(".input-add", "post");
    let response = await fetch("/api/cupcakes", fetchObj);
    let newCake = new Cupcake((await response.json()).cupcake);
    this.cupcakes.push(newCake);
    this.addCupcake(newCake);
  }

  getCupcakeById(id) {
    matchingCake = this.cupcakes.filter((cake) => {
      return cake.id == id;
    });
    return matchingCake[0];
  }

  deleteCupcake(id) {
    this.cupcakes = this.cupcakes.filter((cake) => {
      return cake.id != id;
    });
  }
}

function convertInputIntoFetchObj(inputClass, fetchMethod) {
  let inputs = Array.from($(inputClass));
  let inputNamesAndValues = inputs.reduce((inputObj, currInput) => {
    if (Boolean(currInput.value)) {
      inputObj[currInput.name] = currInput.value;
    }
    return inputObj;
  }, {});
  let fetchObj = {
    method: fetchMethod,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputNamesAndValues),
  };
  $(inputClass).val("");
  return fetchObj;
}

const cakesList = new CupcakeList();
$("#add-submit").click((evt) => {
  evt.preventDefault();
  cakesList.submitNewCupcake();
});