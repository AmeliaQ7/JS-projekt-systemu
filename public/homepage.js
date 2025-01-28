
        $(function () {
            $("#checkin").datepicker({
                minDate: new Date(),
                dateFormat: "yy-mm-dd",
                onSelect: function (dateText) {
                    const minDate = new Date(dateText);
                    minDate.setDate(minDate.getDate() + 1);
                    $("#checkout").datepicker("option", "minDate", minDate);
                }
            });

            $("#checkout").datepicker({
                dateFormat: "yy-mm-dd"
            });
        });
