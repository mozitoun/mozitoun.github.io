import { BrowserQRCodeReader } from "@zxing/library";
import { verifyJWS, decodeJWS, getScannedJWS } from "./shc";
import Swal from 'sweetalert2'

function setResult(result) {
  document.getElementById("result").textContent = result;
}

function decodeOnce(codeReader, selectedDeviceId) {
  codeReader.decodeFromInputVideoDevice(selectedDeviceId, "video").then(
    (result) => {
      const scannedJWS = getScannedJWS(result.text);
      verifyJWS(scannedJWS).then(
        function () {
          return decodeJWS(scannedJWS).then((decoded) => {
            Swal.fire(
              'Good job!',
              'Ton Code QR et valid!',
              'success'
            )
            location.replace("http://127.0.0.1:8000/pluginVaccin?name="+decoded[0]["resource"]["name"][0]["given"][0]+"&ln="+decoded[0]["resource"]["name"][0]["family"][0]+"&bd="+decoded[0]["resource"]["birthDate"])
          }
           
          );
        },
        function (e) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: '<a>COde QR no Conforme</a>'
          })          
          setResult("This looks like a fake vaccination proof");
        }
      );
    },
    (err) => {
      setResult(err);
    }
  );
}

function getFirstPart(codeReader, selectedDeviceId) {
  codeReader.decodeFromInputVideoDevice(selectedDeviceId, "video1").then(
    (result) => {
      sessionStorage.setItem('firstpart' , result.text);
      var video = document.getElementById("myVideoPlayer");
      document.getElementById('video1').style.display = 'none';
      Swal.fire('premier code scanne, scan ton deuxieme!')

      return result.text;
    },
    (err) => {
      setResult(err);
    }
  );
}

function getSecondPart(codeReader, selectedDeviceId,FirstPart) {
  codeReader.decodeFromInputVideoDevice(selectedDeviceId, "video2").then(
    (result) => {
            let begin  = FirstPart.slice(9);
            let end  = result.text.slice(9);
            result.text = "shc:/"+begin+end;
      const scannedJWS = getScannedJWS(result.text);
            
      verifyJWS(scannedJWS).then(
        function () {
          return decodeJWS(scannedJWS).then((decoded) => {
            Swal.fire(
              'Good job!',
              'Ton Code QR et valid!',
              'success'
            )
            location.replace("http://127.0.0.1:8000/pluginVaccin?name="+decoded[0]["resource"]["name"][0]["given"][0]+"&ln="+decoded[0]["resource"]["name"][0]["family"][0]+"&bd="+decoded[0]["resource"]["birthDate"])
          }
           
          );
        }
      );
    },
    (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
        footer: '<a>COde QR no Conforme</a>'
      })      
      setResult(err);
    }
  );
}


let selectedDeviceId;
const codeReader = new BrowserQRCodeReader();

codeReader
  .getVideoInputDevices()
  .then((videoInputDevices) => {
    const sourceSelect = document.getElementById("sourceSelect");
    selectedDeviceId = videoInputDevices[0].deviceId;
    if (videoInputDevices.length >= 1) {
      videoInputDevices.forEach((element) => {
        const sourceOption = document.createElement("option");
        sourceOption.text = element.label;
        sourceOption.value = element.deviceId;
        sourceSelect.appendChild(sourceOption);
      });

      sourceSelect.onchange = () => {
        selectedDeviceId = sourceSelect.value;
      };

      const sourceSelectPanel = document.getElementById("sourceSelectPanel");
      sourceSelectPanel.style.display = "block";
    }

    document.getElementById("startButton").addEventListener("click", () => {
      decodeOnce(codeReader, selectedDeviceId);
    });
    var firstpart = ""
    document.getElementById("startButton1").addEventListener("click", async () => {
      firstpart = await getFirstPart(codeReader, selectedDeviceId);
      if(firstpart){
        document.getElementById('video1').style.display = 'none';
      }
    });
    document.getElementById("startButton2").addEventListener("click", () => {
      getSecondPart(codeReader, selectedDeviceId,sessionStorage.getItem('firstpart'))
    });

    document.getElementById("reset_all").addEventListener("click", () => {
      codeReader.reset();
      setResult("");
    });
  })
  .catch((err) => {

  });
