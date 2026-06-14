use std::io::Cursor;
use image::DynamicImage;

fn main() {
    let monitors = xcap::Monitor::all().unwrap();
    let m = &monitors[0];
    let image = m.capture_image().unwrap();
    
    let mut jpeg_bytes = Vec::new();
    let rgb_image = DynamicImage::ImageRgba8(image).into_rgb8();
    let res = rgb_image.write_to(&mut Cursor::new(&mut jpeg_bytes), image::ImageFormat::Jpeg);
    println!("JPEG encode result: {:?}", res.is_ok());
}
