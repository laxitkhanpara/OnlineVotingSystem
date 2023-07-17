$(document).ready(function () {

    $(document).on("click", "#getpdf", function () {

        html2canvas($('#pdfContent')[0], {
            onrendered: function (canvas) {
                var data = canvas.toDataURL();
                var docDefinition = {
                    content: [{
                        image: data,
                        width: 500
                    }]
                };
                pdfMake.createPdf(docDefinition).download("Cirtification of voting.pdf");
            }
        });
    
    });
    //==================country
    $(document).on("input", "#country_tap", function () {
        alert("working")
        //var value = $("#country_tap").val();
        var value = $("#country_tap option:selected").attr("data-countryId");
        var base_url = window.location.origin
        $.ajax({
            url: base_url + "/state/ajax/" + value,
            type: "get",
            dataType: "json",
            success: function (res) {
                $('#state_tap').empty()
                $("#state_tap").html("<option value selected disabled>select state</option>")
                $.each(res.states, function (data, value) {

                    $('#state_tap').append('<option value="' + value.name + '" data-state="' + value.isoCode + '" data-country="' + value.countryCode + '">' + value.name + '</option>');

                })
            }
        })
    })
    //================state
    $(document).on("input", "#state_tap", function () {
        var value = $("#state_tap option:selected").attr("data-state");
        var country = $("#state_tap option:selected").attr("data-country");
        var base_url = window.location.origin
        $.ajax({
            url: base_url + "/city/ajax",
            type: "post",
            dataType: "json",
            data: { country, value },
            success: function (res) {

                $.each(res.citys, function (data, value) {
                    $("#city_tap").append('<option value="' + value.name + '" >' + value.name + '</option>');
                })
            }
        })
    })
    //===============edit Voter Details
    $(document).on("click", "#editData", function () {
        const id = $(this).attr("data-id")
        $("#FirstName").val($(this).attr("data-FirstName"))
        $("#LastName").val($(this).attr("data-LastName"))
        $("#VoterId").val($(this).attr("data-VoterId"))
        $("#mobile").val($(this).attr("data-mobile"))
        $("#Country").val($(this).attr("data-Country"))
        $("#State").val($(this).attr("data-State"))
        $("#City").val($(this).attr("data-City"))
        $("#Street").val($(this).attr("data-Street"))
        $("#zipCode").val($(this).attr("data-zipCode"))
        $("#previews").attr('src', "../upload/" + $(this).attr("data-image"))
        $("#image-inputs").attr('src', "1689237590207.png")
        $("#formaction").attr('action', 'EditVoter/' + id)
    })

    // ================Make Elaction=====================
    $(document).on("input", "#MakeElaction", function () {
        var MakeElaction = $(this).val();
        var base_url = window.location.origin
        $.ajax({
            url: base_url + "/MakeElaction/ajax",
            type: "post",
            dataType: "json",
            data: { MakeElaction },
            success: function (res) {

                $("#MakeElactionfield").append(
                    '<div class="row">' +
                    '<div class="col-sm-6 col-md-6">' +
                    ' <div class="mb-3">' +
                    '<input readonly name="CandidateName"  class="form-control" type="text" value="' + res.CandidateDetail.PartyName + '">' +
                    '</div>' +
                    '</div>' +
                    '<div class="col-sm-6 col-md-6">' +
                    '<div class="mb-3">' +
                    '    <input readonly name="CandidateVotes" class="form-control" type="text" value="' + res.Aumount + '">' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                )
            }
        })
    })

    //================Make Elaction=====================
    // $(document).on("click", "#takeElaction", function () {
    //     var selectedElection = $("input[name='selectedVoter']:checked");
    //     if (selectedElection.length > 0) {
    //       var MakeElaction = selectedElection.val();
    //     } else {
    //       alert("Please select an election");
    //     }

    //     var base_url = window.location.origin
    //     $.ajax({
    //         url: base_url + "/SelectElection/ajax",
    //         type: "post",
    //         dataType: "json",
    //         data: { MakeElaction },
    //         success: function (res) {

    //             $("#DisplayCandidates").append(

    //             )
    //         }
    //     })
    // })

    $(verifyotppart).hide();
    //==================Get Otp
    $(document).on("click", "#GetOtpbtn", function () {
        $($(this).hide()).hide();
        var VoterId = $("#GetOtp").val();
        // var value = $("#country_tap option:selected").attr("data-countryId");
        var base_url = window.location.origin
        $.ajax({
            url: base_url + "/GetOtp/ajax",
            type: "post",
            dataType: "json",
            data: { VoterId },
            success: function (res) {
                $(verifyotppart).show();
                $("#RealOtp").val(res.otp)
            }
        })
    })
})
/*-------------------------------
          showing image
  ----------------------------------*/

var image = document.getElementById("image-input");
var previewImage = document.getElementById("preview")
image.addEventListener('change', function (event) {
    if (event.target.files.length == 0) {
        return;
    }
    var tempURL = URL.createObjectURL(event.target.files[0]);
    previewImage.setAttribute('src', tempURL)
});


//show Symbole of party
var image = document.getElementById("Symbole-input");
var previewSymboleImage = document.getElementById("previewSymbole")
image.addEventListener('change', function (event) {
    if (event.target.files.length == 0) {
        return;
    }
    var tempURL = URL.createObjectURL(event.target.files[0]);
    previewSymboleImage.setAttribute('src', tempURL)
});

var images = document.getElementById("image-inputs");
var previewImage = document.getElementById("preview")
images.addEventListener('change', function (event) {
    if (event.target.files.length == 0) {
        return;
    }
    var tempURL = URL.createObjectURL(event.target.files[0]);
    previewImage.setAttribute('src', tempURL)
});
