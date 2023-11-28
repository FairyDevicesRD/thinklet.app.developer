export const baseUrl = "https://github.com/FairyDevicesRD/thinklet.app.developer"

export function Samples() {
    const u = `${baseUrl}/tree/main/samples`;
    return <a href={u}>Samples</a>
};

export function SampleVideoRecorderRoot() {
    const u = `${baseUrl}/tree/main/samples/videoRecorder`;
    return <a href={u}>VideoRecorder</a>
};

export function SampleMultiAudioRecorderRoot() {
    const u = `${baseUrl}/tree/main/samples/multiChannelAudioRecorder`;
    return <a href={u}>MultiAudioRecorder</a>
};

export function VideoRecorder() {
    const u = `${baseUrl}/tree/main/samples/videoRecorder/app/src/main/java/com/example/fd/camera/VideoRecorder.kt`;
    return <a href={u}>VideoRecorder.kt</a>
};

export function FiveChannelRecorder() {
    const u = `${baseUrl}/tree/main/samples/multiChannelAudioRecorder/app/src/main/java/com/example/fd/multichannelaudiorecorder/FiveChannelRecorder.kt`;
    return <a href={u}>FiveChannelRecorder.kt</a>
}
