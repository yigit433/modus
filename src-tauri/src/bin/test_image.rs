use std::time::Instant;
use std::io::Cursor;
use base64::{Engine as _, engine::general_purpose::STANDARD};

fn main() {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::display::{CGDisplay, CGRect, CGPoint, CGSize};
        use core_graphics::image::CGImage;
        let display = CGDisplay::main();
        let rect = CGRect::new(&CGPoint::new(0.0, 0.0), &CGSize::new(200.0, 200.0));
        let cg_img = display.image_for_rect(rect).unwrap();
        
        let width = cg_img.width() as u32;
        let height = cg_img.height() as u32;
        let bytes_per_row = cg_img.bytes_per_row();
        let bpp = cg_img.bits_per_pixel();
        
        println!("w: {}, h: {}, bpr: {}, bpp: {}", width, height, bytes_per_row, bpp);
        
        let data = cg_img.data();
        let bytes = data.bytes();
        
        // Convert BGRA to RGBA (CoreGraphics usually outputs BGRA for screen capture)
        let mut rgba_bytes = Vec::with_capacity((width * height * 4) as usize);
        for y in 0..height {
            let row_start = (y as usize) * bytes_per_row;
            for x in 0..width {
                let pixel_start = row_start + (x as usize) * 4;
                if pixel_start + 3 < bytes.len() {
                    let b = bytes[pixel_start];
                    let g = bytes[pixel_start + 1];
                    let r = bytes[pixel_start + 2];
                    let a = bytes[pixel_start + 3];
                    rgba_bytes.push(r);
                    rgba_bytes.push(g);
                    rgba_bytes.push(b);
                    rgba_bytes.push(a);
                } else {
                    rgba_bytes.extend_from_slice(&[0, 0, 0, 255]);
                }
            }
        }
        
        let img = image::RgbaImage::from_raw(width, height, rgba_bytes).unwrap();
        let rgb_image = image::DynamicImage::ImageRgba8(img).into_rgb8();
        
        let mut jpeg_bytes = Vec::new();
        rgb_image.write_to(&mut Cursor::new(&mut jpeg_bytes), image::ImageFormat::Jpeg).unwrap();
        let b64 = STANDARD.encode(&jpeg_bytes);
        println!("b64 length: {}", b64.len());
    }
}
